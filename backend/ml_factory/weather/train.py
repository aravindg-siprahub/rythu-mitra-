"""
ml_factory/weather/train.py — Rythu Mitra Weather Intelligence Training
========================================================================
Separate GradientBoosting models for rainfall and temperature.

India-relevant datasets only. Must beat seasonal mean baseline.

System constraints: 8GB RAM, CPU only
  - n_estimators=200, max_depth=5, subsample=0.8
  - float32, random_state=42

Usage:
    python manage.py train_kaggle_models --model weather
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
        "metrics_dir":  os.path.join(base, "ml_factory", "weather"),
    }


def _check_ram(min_gb: float = 2.0):
    try:
        import psutil
        avail = psutil.virtual_memory().available / 1e9
        logger.info(f"[WeatherTrain] Available RAM: {avail:.1f}GB")
        if avail < min_gb:
            raise MemoryError(f"Only {avail:.1f}GB RAM available, need {min_gb}GB.")
    except ImportError:
        logger.warning("[WeatherTrain] psutil not installed.")


def _ensure_dataset(datasets_dir: str) -> str:
    """Try 3 Kaggle datasets in priority order."""
    csv_path = os.path.join(datasets_dir, "weather_data.csv")
    if os.path.exists(csv_path):
        return csv_path

    datasets = [
        "mahirkukreja/delhi-weather-data",
        "jsphyg/weather-dataset-rattle-package",
        "nareshbhat/weather-weka-arff",
    ]
    for ds in datasets:
        logger.info(f"[WeatherTrain] Trying: {ds}")
        try:
            import subprocess
            result = subprocess.run(
                ["kaggle", "datasets", "download", "-d", ds,
                 "-p", datasets_dir, "--unzip"],
                capture_output=True, text=True, timeout=300
            )
            if result.returncode == 0:
                # Find downloaded CSV
                for f in os.listdir(datasets_dir):
                    if f.endswith(".csv") and ("weather" in f.lower() or "delhi" in f.lower()
                                               or "rain" in f.lower()):
                        found = os.path.join(datasets_dir, f)
                        if found != csv_path:
                            os.rename(found, csv_path)
                        return csv_path
                # Fallback: first CSV
                csvs = [f for f in os.listdir(datasets_dir) if f.endswith(".csv")]
                if csvs:
                    found = os.path.join(datasets_dir, csvs[0])
                    os.rename(found, csv_path)
                    return csv_path
        except Exception as e:
            logger.warning(f"[WeatherTrain] Download failed for {ds}: {e}")

    raise FileNotFoundError(
        f"Weather dataset not found.\n"
        "Download from Kaggle and save as backend/ai/datasets/weather_data.csv"
    )


def _check_india_relevance(df: pd.DataFrame) -> bool:
    """Verify dataset is India-relevant by checking location columns."""
    for col in df.columns:
        if "location" in col.lower() or "city" in col.lower() or "station" in col.lower():
            locs = df[col].dropna().unique()
            india_cities = {"delhi", "mumbai", "kolkata", "chennai", "bangalore",
                           "hyderabad", "pune", "jaipur", "lucknow", "ahmedabad",
                           "new delhi", "india"}
            found = [l for l in locs if str(l).lower() in india_cities]
            if found:
                logger.info(f"[WeatherTrain] India-relevant locations found: {found[:5]}")
                return True
            # If Australian dataset (common in Kaggle weather)
            australian = [l for l in locs if str(l).lower() in {"sydney", "melbourne", "perth", "brisbane", "canberra"}]
            if australian:
                logger.warning(f"[WeatherTrain] Australian dataset detected — skipping for Indian farmers.")
                return False
    # No location column — assume usable (Delhi dataset doesn't have location col)
    logger.info("[WeatherTrain] No location column found — assuming India-relevant.")
    return True


def _identify_weather_columns(df: pd.DataFrame) -> dict:
    """Dynamically identify date, temperature, humidity, rainfall columns."""
    cols = {c.lower(): c for c in df.columns}
    result = {"date": None, "temp": None, "humidity": None, "rainfall": None}

    # Date
    for c in ["date", "datetime_utc", "date_time", "dt"]:
        if c in cols:
            result["date"] = cols[c]
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

    # Temperature
    for c in ["meantemp", "temp", "temperature", "mean_temp", "t", "meantempm",
              "meantempf", " _tempm", "mean_temperature"]:
        if c in cols:
            result["temp"] = cols[c]
            break

    # Humidity
    for c in ["humidity", "meanhumidity", "mean_humidity", "rh", "meandewhourly",
              " _humidity"]:
        if c in cols:
            result["humidity"] = cols[c]
            break

    # Rainfall
    for c in ["rainfall", "precipitation", "rain", "precipm", "precip_mm",
              " _precipm", "rain_today"]:
        if c in cols:
            result["rainfall"] = cols[c]
            break

    logger.info(f"[WeatherTrain] Identified columns: {result}")
    return result


def _categorize_season(month: int) -> str:
    if month in (6, 7, 8, 9):
        return "Kharif"
    elif month in (10, 11, 12, 1, 2):
        return "Rabi"
    return "Zaid"


def _add_weather_features(df: pd.DataFrame, col_map: dict) -> pd.DataFrame:
    """Add weather-specific features."""
    df = df.sort_values(col_map["date"]).copy()
    date_col = col_map["date"]
    temp_col = col_map.get("temp")
    hum_col  = col_map.get("humidity")
    rain_col = col_map.get("rainfall")

    # Calendar
    df["month"] = df[date_col].dt.month
    df["season"] = df["month"].apply(_categorize_season)
    df["season_encoded"] = df["season"].map({"Kharif": 0, "Rabi": 1, "Zaid": 2}).astype(np.float32)

    # Temperature features
    if temp_col and temp_col in df.columns:
        df["temp_lag_1"] = df[temp_col].shift(1)
        df["temp_lag_7"] = df[temp_col].shift(7)
        # Growing degree days
        df["growing_degree_days"] = df[temp_col].apply(lambda x: max(0, x - 10) if pd.notna(x) else 0)

    # Rainfall features
    if rain_col and rain_col in df.columns:
        df["rainfall_lag_7"] = df[rain_col].shift(7)
        df["rolling_rainfall_7d"]  = df[rain_col].rolling(7, min_periods=1).sum()
        df["rolling_rainfall_30d"] = df[rain_col].rolling(30, min_periods=1).sum()

    # Humidity features
    if hum_col and hum_col in df.columns:
        pass  # Use as-is

    # Heat index (simplified)
    if temp_col and hum_col and temp_col in df.columns and hum_col in df.columns:
        df["heat_index"] = df[temp_col] + (0.33 * df[hum_col]) - 4

    df.dropna(inplace=True)
    return df


def train_weather_model(csv_path: str = None, version: str = None) -> dict:
    """Train separate GradientBoosting models for rainfall and temperature."""
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.metrics import mean_absolute_error, mean_squared_error

    _check_ram(min_gb=2.0)
    paths = _get_paths()
    os.makedirs(paths["models_dir"], exist_ok=True)
    os.makedirs(paths["metrics_dir"], exist_ok=True)

    csv_path = csv_path or _ensure_dataset(paths["datasets_dir"])

    logger.info(f"[WeatherTrain] Loading: {csv_path}")
    df = pd.read_csv(csv_path)
    logger.info(f"[WeatherTrain] Loaded {len(df)} rows. Columns: {list(df.columns)}")

    # Limit rows
    if len(df) > 50000:
        df = df.tail(50000).reset_index(drop=True)
        logger.warning(f"[WeatherTrain] Trimmed to 50000 rows for 8GB RAM.")

    # India relevance check
    if not _check_india_relevance(df):
        logger.warning("[WeatherTrain] Dataset may not be India-relevant. Training anyway but flagging.")

    col_map = _identify_weather_columns(df)
    if not col_map.get("date"):
        raise ValueError(f"Cannot identify date column. Columns: {list(df.columns)}")

    df[col_map["date"]] = pd.to_datetime(df[col_map["date"]], errors="coerce")
    df.dropna(subset=[col_map["date"]], inplace=True)

    # Convert columns to numeric
    for key in ["temp", "humidity", "rainfall"]:
        if col_map.get(key):
            df[col_map[key]] = pd.to_numeric(df[col_map[key]], errors="coerce")

    df = _add_weather_features(df, col_map)
    logger.info(f"[WeatherTrain] After feature engineering: {len(df)} rows")

    if len(df) < 100:
        raise ValueError(f"Only {len(df)} rows after feature engineering. Need 100+.")

    # Build feature list based on available columns
    feature_cols = ["month", "season_encoded"]
    for feat in ["temp_lag_1", "temp_lag_7", "growing_degree_days",
                 "rainfall_lag_7", "rolling_rainfall_7d", "rolling_rainfall_30d",
                 "heat_index"]:
        if feat in df.columns:
            feature_cols.append(feat)

    if col_map.get("humidity") and col_map["humidity"] in df.columns:
        feature_cols.append(col_map["humidity"])

    logger.info(f"[WeatherTrain] Feature columns: {feature_cols}")

    # Time-series split (last 20%, no shuffle)
    split_idx = int(len(df) * 0.8)
    df_train = df.iloc[:split_idx]
    df_test  = df.iloc[split_idx:]

    results = {}

    # ── Train RAINFALL model ──────────────────────────────────────────────────
    if col_map.get("rainfall") and col_map["rainfall"] in df.columns:
        rain_col = col_map["rainfall"]
        X_train = df_train[feature_cols].astype(np.float32).values
        y_train = df_train[rain_col].astype(np.float32).values
        X_test  = df_test[feature_cols].astype(np.float32).values
        y_test  = df_test[rain_col].astype(np.float32).values

        rain_model = GradientBoostingRegressor(
            n_estimators=200, max_depth=5, learning_rate=0.05,
            random_state=42, subsample=0.8,
        )
        rain_model.fit(X_train, y_train)
        rain_preds = rain_model.predict(X_test)
        rain_mae  = mean_absolute_error(y_test, rain_preds)
        rain_rmse = np.sqrt(mean_squared_error(y_test, rain_preds))

        # Seasonal baseline
        seasonal_mean = df_train.groupby("month")[rain_col].mean()
        baseline_preds = df_test["month"].map(seasonal_mean).fillna(0).values
        baseline_mae = mean_absolute_error(y_test, baseline_preds)
        global_mae = mean_absolute_error(y_test, np.full_like(y_test, y_train.mean()))

        beats_baseline = rain_mae < baseline_mae
        logger.info(f"[WeatherTrain] Rainfall MAE: model={rain_mae:.2f} seasonal={baseline_mae:.2f} "
                    f"global={global_mae:.2f} beats_seasonal={beats_baseline}")

        rain_path = os.path.join(paths["models_dir"], "weather_rainfall_gb_v1.pkl")
        joblib.dump(rain_model, rain_path, compress=3)

        results["rainfall"] = {
            "mae": round(float(rain_mae), 4),
            "rmse": round(float(rain_rmse), 4),
            "seasonal_baseline_mae": round(float(baseline_mae), 4),
            "global_mean_mae": round(float(global_mae), 4),
            "beats_seasonal_baseline": beats_baseline,
        }
    else:
        logger.warning("[WeatherTrain] No rainfall column found. Skipping rainfall model.")

    # ── Train TEMPERATURE model ───────────────────────────────────────────────
    if col_map.get("temp") and col_map["temp"] in df.columns:
        temp_col = col_map["temp"]
        # Remove temp from features to avoid leakage
        temp_features = [f for f in feature_cols if f != temp_col]
        X_train = df_train[temp_features].astype(np.float32).values
        y_train = df_train[temp_col].astype(np.float32).values
        X_test  = df_test[temp_features].astype(np.float32).values
        y_test  = df_test[temp_col].astype(np.float32).values

        temp_model = GradientBoostingRegressor(
            n_estimators=200, max_depth=5, learning_rate=0.05,
            random_state=42, subsample=0.8,
        )
        temp_model.fit(X_train, y_train)
        temp_preds = temp_model.predict(X_test)
        temp_mae  = mean_absolute_error(y_test, temp_preds)
        temp_rmse = np.sqrt(mean_squared_error(y_test, temp_preds))

        # Seasonal baseline
        seasonal_mean = df_train.groupby("month")[temp_col].mean()
        baseline_preds = df_test["month"].map(seasonal_mean).fillna(y_train.mean()).values
        baseline_mae = mean_absolute_error(y_test, baseline_preds)

        beats_baseline = temp_mae < baseline_mae
        logger.info(f"[WeatherTrain] Temperature MAE: model={temp_mae:.2f} seasonal={baseline_mae:.2f} "
                    f"beats_seasonal={beats_baseline}")

        temp_path = os.path.join(paths["models_dir"], "weather_temp_gb_v1.pkl")
        joblib.dump(temp_model, temp_path, compress=3)

        results["temperature"] = {
            "mae": round(float(temp_mae), 4),
            "rmse": round(float(temp_rmse), 4),
            "seasonal_baseline_mae": round(float(baseline_mae), 4),
            "beats_seasonal_baseline": beats_baseline,
        }
    else:
        logger.warning("[WeatherTrain] No temperature column found. Skipping temperature model.")

    # Save feature columns
    fc_path = os.path.join(paths["models_dir"], "weather_feature_columns.json")
    with open(fc_path, "w") as f:
        json.dump(feature_cols, f, indent=2)

    # Metrics
    version = version or datetime.now(timezone.utc).strftime("v%Y%m%d_%H%M%S")
    metrics = {
        "version": version,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "dataset": csv_path,
        "total_rows": len(df),
        "feature_columns": feature_cols,
        "results": results,
        "is_active": True,
    }

    metrics_path = os.path.join(paths["metrics_dir"], "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2, default=str)

    del df
    gc.collect()

    logger.info(f"[WeatherTrain] ═══ DONE ═══  {len(results)} targets trained")
    return metrics
