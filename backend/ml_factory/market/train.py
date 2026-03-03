"""
ml_factory/market/train.py — Rythu Mitra Market Price Forecasting
==================================================================
Per-commodity XGBoost with prediction intervals (quantile regression).

CRITICAL: Train SEPARATE model per commodity. Never one global model.
Never shuffle time-series data.

System constraints: 8GB RAM, CPU only
  - n_jobs=2, max_depth=6, n_estimators=200, tree_method='hist'
  - float32 everywhere

Accept gate: MAPE < 15% (warn if not met, still save)
Must beat naive baseline (predict = yesterday's price).

Usage:
    python manage.py train_kaggle_models --model market
"""

import os
import gc
import json
import logging
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
np.random.seed(42)


def _get_paths():
    from django.conf import settings
    base = settings.BASE_DIR
    return {
        "models_dir":  os.path.join(base, "ai", "models"),
        "datasets_dir": os.path.join(base, "ai", "datasets"),
        "metrics_dir":  os.path.join(base, "ml_factory", "market"),
    }


def _check_ram(min_gb: float = 2.0):
    try:
        import psutil
        avail = psutil.virtual_memory().available / 1e9
        logger.info(f"[MarketTrain] Available RAM: {avail:.1f}GB")
        if avail < min_gb:
            raise MemoryError(f"Only {avail:.1f}GB RAM available, need {min_gb}GB.")
    except ImportError:
        logger.warning("[MarketTrain] psutil not installed.")


def _ensure_dataset(datasets_dir: str) -> str:
    """Try primary then fallback Kaggle datasets. Returns CSV path."""
    csv_path = os.path.join(datasets_dir, "market_prices.csv")
    if os.path.exists(csv_path):
        return csv_path

    # Try downloading
    datasets = [
        "raghu1999/agriculture-commodity-prices",
        "kianwee/agricultural-raw-material-prices-1990-2020",
    ]
    for ds in datasets:
        logger.info(f"[MarketTrain] Trying Kaggle download: {ds}")
        try:
            import subprocess
            result = subprocess.run(
                ["kaggle", "datasets", "download", "-d", ds,
                 "-p", datasets_dir, "--unzip"],
                capture_output=True, text=True, timeout=300
            )
            if result.returncode == 0:
                # Find the downloaded CSV
                for f in os.listdir(datasets_dir):
                    if f.endswith(".csv") and "price" in f.lower():
                        found_path = os.path.join(datasets_dir, f)
                        if found_path != csv_path:
                            os.rename(found_path, csv_path)
                        return csv_path
                # If no obvious match, pick first CSV
                csvs = [f for f in os.listdir(datasets_dir) if f.endswith(".csv")]
                if csvs:
                    found_path = os.path.join(datasets_dir, csvs[0])
                    os.rename(found_path, csv_path)
                    return csv_path
        except Exception as e:
            logger.warning(f"[MarketTrain] Download failed for {ds}: {e}")

    raise FileNotFoundError(
        f"Market dataset not found at {csv_path}\n"
        "Download from Kaggle and save as backend/ai/datasets/market_prices.csv"
    )


def _identify_columns(df: pd.DataFrame) -> dict:
    """Dynamically identify date, price, and commodity columns."""
    cols = {c.lower(): c for c in df.columns}
    result = {"date": None, "price": None, "commodity": None}

    # Date column
    for candidate in ["date", "arrival_date", "reported_date", "dt"]:
        if candidate in cols:
            result["date"] = cols[candidate]
            break
    if not result["date"]:
        for c in df.columns:
            if df[c].dtype == "object":
                try:
                    pd.to_datetime(df[c].head(10))
                    result["date"] = c
                    break
                except Exception:
                    pass

    # Price column
    for candidate in ["modal_price", "price", "modal price", "close", "value"]:
        if candidate in cols:
            result["price"] = cols[candidate]
            break
    if not result["price"]:
        numeric = df.select_dtypes(include=[np.number]).columns
        if len(numeric) > 0:
            result["price"] = numeric[0]

    # Commodity column
    for candidate in ["commodity", "crop", "item", "product", "commodity_name"]:
        if candidate in cols:
            result["commodity"] = cols[candidate]
            break

    logger.info(f"[MarketTrain] Identified columns: {result}")
    return result


def _add_features(df: pd.DataFrame, price_col: str, date_col: str) -> pd.DataFrame:
    """Add lag, rolling, and calendar features. Sort by date FIRST."""
    df = df.sort_values(date_col).copy()
    p = price_col

    # Lag features
    df["price_lag_7"]  = df[p].shift(7)
    df["price_lag_14"] = df[p].shift(14)
    df["price_lag_30"] = df[p].shift(30)

    # Rolling features
    df["rolling_mean_7d"]  = df[p].rolling(7, min_periods=1).mean()
    df["rolling_mean_30d"] = df[p].rolling(30, min_periods=1).mean()
    df["price_pct_change_7d"] = df[p].pct_change(7)

    # Calendar features
    df["month"]   = df[date_col].dt.month
    df["quarter"] = df[date_col].dt.quarter
    df["year"]    = df[date_col].dt.year
    df["is_harvest_month"]   = df["month"].isin([4, 5, 10, 11]).astype(np.float32)
    df["is_festival_season"] = df["month"].isin([10, 11, 12]).astype(np.float32)

    # Previous year same month price (approximate)
    df["prev_year_price"] = df[p].shift(365)

    # Drop NaN from lag generation
    df.dropna(inplace=True)

    return df


FEATURE_COLS = [
    "price_lag_7", "price_lag_14", "price_lag_30",
    "rolling_mean_7d", "rolling_mean_30d", "price_pct_change_7d",
    "month", "quarter", "year",
    "is_harvest_month", "is_festival_season", "prev_year_price",
]


def _train_single_commodity(df_commodity: pd.DataFrame, commodity_name: str,
                            price_col: str, models_dir: str) -> dict:
    """Train 3 XGBoost models (median + q10 + q90) for one commodity."""
    from xgboost import XGBRegressor

    if len(df_commodity) < 60:
        logger.warning(f"[MarketTrain] {commodity_name}: only {len(df_commodity)} rows, skipping.")
        return {"commodity": commodity_name, "skipped": True, "reason": "too few rows"}

    X = df_commodity[FEATURE_COLS].astype(np.float32).values
    y = df_commodity[price_col].astype(np.float32).values

    # Time-based split (last 20%)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    # Naive baseline
    naive_preds = np.roll(y_test, 1)
    naive_preds[0] = y_train[-1]
    naive_mae = np.mean(np.abs(y_test - naive_preds))

    # Train main model
    main_model = XGBRegressor(
        n_estimators=200, max_depth=6, learning_rate=0.05,
        tree_method="hist", n_jobs=2, random_state=42,
    )
    main_model.fit(X_train, y_train,
                   eval_set=[(X_test, y_test)], verbose=False)
    main_preds = main_model.predict(X_test)
    model_mae  = np.mean(np.abs(y_test - main_preds))
    model_rmse = np.sqrt(np.mean((y_test - main_preds) ** 2))
    non_zero = y_test[y_test != 0]
    model_mape = np.mean(np.abs((non_zero - main_preds[:len(non_zero)]) / non_zero)) * 100 if len(non_zero) > 0 else 999.0

    # Directional accuracy
    actual_dir  = np.sign(np.diff(y_test))
    pred_dir    = np.sign(np.diff(main_preds))
    dir_accuracy = np.mean(actual_dir == pred_dir) if len(actual_dir) > 0 else 0.0

    # Prediction intervals (quantile models)
    try:
        lower_model = XGBRegressor(
            n_estimators=200, max_depth=6, learning_rate=0.05,
            tree_method="hist", n_jobs=2, random_state=42,
            objective="reg:quantileerror", quantile_alpha=0.1,
        )
        lower_model.fit(X_train, y_train, verbose=False)

        upper_model = XGBRegressor(
            n_estimators=200, max_depth=6, learning_rate=0.05,
            tree_method="hist", n_jobs=2, random_state=42,
            objective="reg:quantileerror", quantile_alpha=0.9,
        )
        upper_model.fit(X_train, y_train, verbose=False)
    except Exception as e:
        logger.warning(f"[MarketTrain] Quantile models failed for {commodity_name}: {e}")
        lower_model, upper_model = None, None

    # Save models
    safe_name = commodity_name.lower().replace(" ", "_").replace("/", "_")
    joblib.dump(main_model, os.path.join(models_dir, f"market_xgb_{safe_name}_v1.pkl"), compress=3)
    if lower_model:
        joblib.dump(lower_model, os.path.join(models_dir, f"market_xgb_{safe_name}_lower_v1.pkl"), compress=3)
    if upper_model:
        joblib.dump(upper_model, os.path.join(models_dir, f"market_xgb_{safe_name}_upper_v1.pkl"), compress=3)

    beats_naive = model_mae < naive_mae
    if not beats_naive:
        logger.warning(f"[MarketTrain] {commodity_name}: model MAE {model_mae:.2f} > naive MAE {naive_mae:.2f}")

    if model_mape > 15:
        logger.warning(f"[MarketTrain] {commodity_name}: MAPE {model_mape:.1f}% > 15% threshold")

    metrics = {
        "commodity": commodity_name,
        "rows": len(df_commodity),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "mae": round(float(model_mae), 4),
        "rmse": round(float(model_rmse), 4),
        "mape": round(float(model_mape), 2),
        "naive_mae": round(float(naive_mae), 4),
        "beats_naive": beats_naive,
        "directional_accuracy": round(float(dir_accuracy), 4),
        "has_intervals": lower_model is not None,
    }
    logger.info(f"[MarketTrain] {commodity_name}: MAE={model_mae:.2f} MAPE={model_mape:.1f}% "
                f"naive_MAE={naive_mae:.2f} beats_naive={beats_naive}")
    return metrics


def train_market_model(csv_path: str = None, version: str = None) -> dict:
    """Train per-commodity XGBoost models for market price forecasting."""
    _check_ram(min_gb=2.0)
    paths = _get_paths()
    os.makedirs(paths["models_dir"], exist_ok=True)
    os.makedirs(paths["metrics_dir"], exist_ok=True)

    csv_path = csv_path or _ensure_dataset(paths["datasets_dir"])

    # Load with float32
    logger.info(f"[MarketTrain] Loading: {csv_path}")
    df = pd.read_csv(csv_path)
    logger.info(f"[MarketTrain] Loaded {len(df)} rows. Columns: {list(df.columns)}")
    logger.info(f"[MarketTrain] Memory: {df.memory_usage().sum()/1e6:.1f}MB")

    # Limit rows for 8GB RAM
    if len(df) > 50000:
        logger.warning(f"[MarketTrain] Dataset has {len(df)} rows. Using last 50,000.")
        df = df.tail(50000).reset_index(drop=True)

    # Identify columns
    col_map = _identify_columns(df)
    if not all(col_map.values()):
        raise ValueError(f"Could not identify all required columns. Found: {col_map}. "
                         f"Available: {list(df.columns)}")

    date_col = col_map["date"]
    price_col = col_map["price"]
    commodity_col = col_map["commodity"]

    # Parse dates
    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    df.dropna(subset=[date_col, price_col], inplace=True)
    df[price_col] = pd.to_numeric(df[price_col], errors="coerce")
    df.dropna(subset=[price_col], inplace=True)

    logger.info(f"[MarketTrain] Date range: {df[date_col].min()} to {df[date_col].max()}")
    logger.info(f"[MarketTrain] Missing values per column:\n{df.isnull().sum()}")

    # Train per commodity
    commodities = df[commodity_col].unique()
    logger.info(f"[MarketTrain] Commodities found: {len(commodities)}")

    all_metrics = []
    for commodity in commodities:
        df_c = df[df[commodity_col] == commodity].copy()
        df_c = _add_features(df_c, price_col, date_col)
        if len(df_c) < 60:
            logger.warning(f"[MarketTrain] Skipping {commodity}: {len(df_c)} rows after feature eng (need 60+)")
            continue
        m = _train_single_commodity(df_c, commodity, price_col, paths["models_dir"])
        all_metrics.append(m)
        gc.collect()

    # Save feature columns
    fc_path = os.path.join(paths["models_dir"], "market_feature_columns.json")
    with open(fc_path, "w") as f:
        json.dump(FEATURE_COLS, f, indent=2)

    # Aggregate metrics
    trained = [m for m in all_metrics if not m.get("skipped")]
    avg_mape = np.mean([m["mape"] for m in trained]) if trained else 999.0
    beats_count = sum(1 for m in trained if m.get("beats_naive"))

    version = version or datetime.now(timezone.utc).strftime("v%Y%m%d_%H%M%S")
    summary = {
        "version": version,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "commodities_trained": len(trained),
        "commodities_skipped": len(all_metrics) - len(trained),
        "avg_mape": round(float(avg_mape), 2),
        "beats_naive_count": beats_count,
        "mape_under_15_pct": sum(1 for m in trained if m["mape"] < 15),
        "feature_columns": FEATURE_COLS,
        "per_commodity": all_metrics,
        "is_active": True,
    }

    metrics_path = os.path.join(paths["metrics_dir"], "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(summary, f, indent=2, default=str)

    del df
    gc.collect()

    logger.info(f"[MarketTrain] ═══ DONE ═══  {len(trained)} commodities trained, "
                f"avg MAPE={avg_mape:.1f}%, {beats_count}/{len(trained)} beat naive")
    return summary
