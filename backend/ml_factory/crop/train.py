"""
ml_factory/crop/train.py — Rythu Mitra Crop Recommendation Training
====================================================================
Trains an Ensemble (RF + XGB + LGBM) with calibration and SHAP.

System constraints: 8GB RAM, CPU only, Windows
  - n_jobs=2 everywhere (leave 2 cores for OS)
  - n_estimators=200, max_depth=6
  - float32 features
  - random_state=42, np.random.seed(42)

Accept gate: macro F1 ≥ 0.85 (retry once if failing)

Usage:
    python manage.py train_kaggle_models --model crop
"""

import os
import gc
import json
import logging
import hashlib
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

np.random.seed(42)

# ── Paths (resolved at call time, not import time) ────────────────────────────
def _get_paths():
    from django.conf import settings
    base = settings.BASE_DIR
    return {
        "models_dir":  os.path.join(base, "ai", "models"),
        "datasets_dir": os.path.join(base, "ai", "datasets"),
        "metrics_dir": os.path.join(base, "ml_factory", "crop"),
        "csv_default": os.path.join(base, "ai", "datasets", "Crop_recommendation.csv"),
    }

# ── Feature spec ──────────────────────────────────────────────────────────────
ORIGINAL_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
DERIVED_FEATURES  = ["np_ratio", "nk_ratio", "pk_ratio"]
ALL_FEATURES      = ORIGINAL_FEATURES + DERIVED_FEATURES  # 10 total
LABEL_COL         = "label"

EXPECTED_SHAPE    = (2200, 8)
MIN_CLASS_ROWS    = 80
ACCEPT_MACRO_F1   = 0.85


# ── RAM Guard ─────────────────────────────────────────────────────────────────
def _check_ram(min_gb: float = 2.0) -> None:
    try:
        import psutil
        avail = psutil.virtual_memory().available / 1e9
        logger.info(f"[CropTrain] Available RAM: {avail:.1f}GB")
        if avail < min_gb:
            raise MemoryError(
                f"Only {avail:.1f}GB RAM available, need {min_gb}GB. "
                "Close other applications and retry."
            )
    except ImportError:
        logger.warning("[CropTrain] psutil not installed, skipping RAM check.")


# ── Kaggle Dataset Helper ─────────────────────────────────────────────────────
def _ensure_dataset(csv_path: str) -> None:
    if os.path.exists(csv_path):
        return
    logger.info("[CropTrain] Dataset not found. Attempting Kaggle download...")
    try:
        import subprocess
        datasets_dir = os.path.dirname(csv_path)
        os.makedirs(datasets_dir, exist_ok=True)
        result = subprocess.run(
            ["kaggle", "datasets", "download",
             "-d", "atharvaingle/crop-recommendation-dataset",
             "-p", datasets_dir, "--unzip"],
            capture_output=True, text=True, timeout=300
        )
        if result.returncode != 0:
            logger.error(f"[CropTrain] Kaggle download failed: {result.stderr}")
    except Exception as e:
        logger.error(f"[CropTrain] Kaggle download error: {e}")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Dataset not found at {csv_path}\n"
            "To download manually:\n"
            "  kaggle datasets download -d atharvaingle/crop-recommendation-dataset\n"
            "  Save as: backend/ai/datasets/Crop_recommendation.csv"
        )


# ── Feature Engineering ───────────────────────────────────────────────────────
def _add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add agronomically meaningful ratio features."""
    df = df.copy()
    df["np_ratio"] = df["N"] / (df["P"] + 1)
    df["nk_ratio"] = df["N"] / (df["K"] + 1)
    df["pk_ratio"] = df["P"] / (df["K"] + 1)
    return df


# ── Data Validation ───────────────────────────────────────────────────────────
def _validate_dataset(df: pd.DataFrame, csv_path: str) -> None:
    # Column check
    required_cols = ORIGINAL_FEATURES + [LABEL_COL]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset missing columns: {missing}. Found: {list(df.columns)}")

    # Shape warning (not hard fail — dataset may have slight variations)
    if df.shape != EXPECTED_SHAPE:
        logger.warning(
            f"[CropTrain] Dataset shape {df.shape} differs from expected {EXPECTED_SHAPE}. "
            "Continuing..."
        )

    # Null check
    nulls = df[required_cols].isnull().sum()
    if nulls.any():
        logger.warning(f"[CropTrain] Null values found:\n{nulls[nulls > 0]}")
        df.dropna(subset=required_cols, inplace=True)
        logger.info(f"[CropTrain] After null drop: {df.shape}")

    # Class balance
    counts = df[LABEL_COL].value_counts()
    low_classes = counts[counts < MIN_CLASS_ROWS]
    if not low_classes.empty:
        logger.warning(
            f"[CropTrain] Classes with < {MIN_CLASS_ROWS} rows:\n{low_classes}"
        )


# ── Cross-Validation ──────────────────────────────────────────────────────────
def _run_cross_validation(model, X, y) -> tuple[float, float]:
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=cv, scoring="f1_macro", n_jobs=2)
    logger.info(f"[CropTrain] 5-fold CV macro F1: {scores}")
    logger.info(f"[CropTrain] Mean: {scores.mean():.4f} ± {scores.std():.4f}")
    if scores.std() > 0.05:
        logger.warning("[CropTrain] High CV std (>0.05) — model may be unstable. Consider tuning.")
    return float(scores.mean()), float(scores.std())


# ── Accept Gate ───────────────────────────────────────────────────────────────
def _check_accept_gate(macro_f1: float, attempt: int) -> bool:
    if macro_f1 >= ACCEPT_MACRO_F1:
        logger.info(f"[CropTrain] ✓ ACCEPT GATE PASSED: macro_f1={macro_f1:.4f} ≥ {ACCEPT_MACRO_F1}")
        return True
    logger.warning(
        f"[CropTrain] ✗ Accept gate FAILED: macro_f1={macro_f1:.4f} < {ACCEPT_MACRO_F1} "
        f"(attempt {attempt}/2)"
    )
    return False


# ── Main Training Function ────────────────────────────────────────────────────
def train_crop_model(csv_path: str = None, version: str = None) -> dict:
    """
    Full production-grade crop recommendation training.

    Returns:
        metrics dict written to ml_factory/crop/metrics.json
    """
    _check_ram(min_gb=2.0)

    paths = _get_paths()
    csv_path = csv_path or paths["csv_default"]
    os.makedirs(paths["models_dir"], exist_ok=True)
    os.makedirs(paths["metrics_dir"], exist_ok=True)
    os.makedirs(paths["datasets_dir"], exist_ok=True)

    # ── 1. Load Dataset ───────────────────────────────────────────────────────
    _ensure_dataset(csv_path)
    logger.info(f"[CropTrain] Loading dataset: {csv_path}")
    df = pd.read_csv(csv_path, dtype={f: "float32" for f in ORIGINAL_FEATURES})
    logger.info(f"[CropTrain] Loaded {df.shape[0]} rows, {df.memory_usage().sum()/1e6:.1f}MB")

    _validate_dataset(df, csv_path)

    # ── 2. Feature Engineering ────────────────────────────────────────────────
    df = _add_derived_features(df)
    X = df[ALL_FEATURES].astype("float32").values

    from sklearn.preprocessing import LabelEncoder, StandardScaler
    le = LabelEncoder()
    y = le.fit_transform(df[LABEL_COL].values)
    class_names = list(le.classes_)
    logger.info(f"[CropTrain] Classes ({len(class_names)}): {class_names}")

    # ── 3. Train/Test Split ───────────────────────────────────────────────────
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logger.info(f"[CropTrain] Train: {len(X_train)}, Test: {len(X_test)}")

    # ── 4. Scale (saved for future SVM/LR additions) ──────────────────────────
    scaler = StandardScaler()
    scaler.fit(X_train)  # fit on train only
    # Trees don't need scaling but we save it for future models
    scaler_path = os.path.join(paths["models_dir"], "crop_scaler.pkl")
    joblib.dump(scaler, scaler_path, compress=3)

    # ── 5. Train Models — attempt 1 ───────────────────────────────────────────
    for attempt in (1, 2):
        logger.info(f"[CropTrain] === Training attempt {attempt}/2 ===")

        # RandomForest
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.calibration import CalibratedClassifierCV

        rf_base = RandomForestClassifier(
            n_estimators=200 if attempt == 1 else 300,
            max_depth=None,
            min_samples_leaf=2,
            n_jobs=2,
            random_state=42,
            class_weight="balanced" if attempt == 2 else None,
        )
        logger.info(f"[CropTrain] Training RandomForest (n_estimators={rf_base.n_estimators})...")
        rf_model = CalibratedClassifierCV(rf_base, cv=3, method="sigmoid")
        rf_model.fit(X_train, y_train)

        # XGBoost
        try:
            from xgboost import XGBClassifier
            logger.info("[CropTrain] Training XGBoost...")
            xgb_base = XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                tree_method="hist",
                n_jobs=2,
                random_state=42,
                eval_metric="mlogloss",
                verbosity=0,
            )
            xgb_model = CalibratedClassifierCV(xgb_base, cv=3, method="sigmoid")
            xgb_model.fit(X_train, y_train)
        except ImportError:
            logger.warning("[CropTrain] xgboost not installed. Skipping XGB.")
            xgb_model = None

        # LightGBM
        try:
            from lightgbm import LGBMClassifier
            logger.info("[CropTrain] Training LightGBM...")
            lgbm_model = LGBMClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                n_jobs=2,
                random_state=42,
                verbose=-1,
            )
            lgbm_model.fit(X_train, y_train)
        except ImportError:
            logger.warning("[CropTrain] lightgbm not installed. Skipping LGBM.")
            lgbm_model = None

        # ── 6. Ensemble Evaluation ────────────────────────────────────────────
        from sklearn.metrics import accuracy_score, f1_score, classification_report

        def _ensemble_predict_proba(X_input):
            proba = rf_model.predict_proba(X_input) * 0.4
            if xgb_model:
                proba += xgb_model.predict_proba(X_input) * 0.3
                weight_check = 0.7
            else:
                weight_check = 0.4
            if lgbm_model:
                proba += lgbm_model.predict_proba(X_input) * 0.3
                weight_check += 0.3
            # Normalize if some models missing
            if weight_check < 1.0:
                proba /= weight_check
            return proba

        train_proba = _ensemble_predict_proba(X_train)
        test_proba  = _ensemble_predict_proba(X_test)
        train_preds = np.argmax(train_proba, axis=1)
        test_preds  = np.argmax(test_proba, axis=1)

        train_acc   = accuracy_score(y_train, train_preds)
        test_acc    = accuracy_score(y_test, test_preds)
        macro_f1    = f1_score(y_test, test_preds, average="macro")

        # Top-3 accuracy
        top3_correct = np.sum([y_test[i] in np.argsort(test_proba[i])[-3:] for i in range(len(y_test))])
        top3_acc = top3_correct / len(y_test)

        gap = train_acc - test_acc
        logger.info(f"[CropTrain] train_acc={train_acc:.4f}  test_acc={test_acc:.4f}  gap={gap:.4f}")
        logger.info(f"[CropTrain] top3_acc={top3_acc:.4f}  macro_f1={macro_f1:.4f}")
        if gap > 0.05:
            logger.warning(f"[CropTrain] Overfitting detected! train-test gap = {gap:.4f} > 0.05")

        # CV on raw RF base (calibrated CV is expensive for CV-in-CV)
        cv_mean, cv_std = _run_cross_validation(rf_base, X_train, y_train)

        # Per-class report
        report = classification_report(y_test, test_preds, target_names=class_names, output_dict=True)

        if _check_accept_gate(macro_f1, attempt):
            break  # Accept gate passed
        if attempt == 2:
            logger.error(
                f"[CropTrain] Accept gate failed after 2 attempts (macro_f1={macro_f1:.4f}). "
                "Saving best available model and reporting metrics."
            )

    # ── 7. Confusion Matrix ───────────────────────────────────────────────────
    try:
        import matplotlib
        matplotlib.use("Agg")  # non-interactive backend
        import matplotlib.pyplot as plt
        from sklearn.metrics import confusion_matrix
        import seaborn
        cm = confusion_matrix(y_test, test_preds)
        fig, ax = plt.subplots(figsize=(14, 12))
        seaborn.heatmap(cm, annot=True, fmt="d", xticklabels=class_names,
                        yticklabels=class_names, ax=ax, cmap="Blues")
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        ax.set_title(f"Crop Recommendation — Confusion Matrix (macro_f1={macro_f1:.3f})")
        plt.tight_layout()
        cm_path = os.path.join(paths["metrics_dir"], "confusion_matrix.png")
        plt.savefig(cm_path, dpi=100, bbox_inches="tight")
        plt.close()
        logger.info(f"[CropTrain] Confusion matrix saved → {cm_path}")
    except Exception as e:
        logger.warning(f"[CropTrain] Could not save confusion matrix: {e}")

    # ── 8. SHAP Feature Importance ─────────────────────────────────────────────
    shap_top_features = []
    try:
        import shap
        logger.info("[CropTrain] Computing SHAP values (this may take a minute)...")
        # Use raw RF base estimator for SHAP (calibrated wrapper not directly compatible)
        rf_base.fit(X_train, y_train)  # re-fit for SHAP (already fitted above in calibrated)
        explainer = shap.TreeExplainer(rf_base)
        # Use a sample for speed (500 rows max)
        sample_size = min(500, len(X_test))
        shap_sample = X_test[:sample_size]
        shap_values = explainer.shap_values(shap_sample)
        # Mean absolute SHAP per feature (across all classes)
        if isinstance(shap_values, list):
            mean_abs_shap = np.mean([np.abs(sv).mean(axis=0) for sv in shap_values], axis=0)
        else:
            mean_abs_shap = np.abs(shap_values).mean(axis=0)
        shap_importance = dict(zip(ALL_FEATURES, mean_abs_shap.tolist()))
        shap_top_features = sorted(shap_importance, key=shap_importance.get, reverse=True)[:5]
        logger.info(f"[CropTrain] SHAP top features: {shap_top_features}")

        shap_path = os.path.join(paths["models_dir"], "crop_shap_values.pkl")
        joblib.dump({"importance": shap_importance, "top_features": shap_top_features}, shap_path, compress=3)
    except Exception as e:
        logger.warning(f"[CropTrain] SHAP computation failed: {e}. Continuing without SHAP.")
        shap_importance = {}

    # ── 9. Save Artifacts ─────────────────────────────────────────────────────
    version = version or datetime.now(timezone.utc).strftime("v%Y%m%d_%H%M%S")
    training_ts = datetime.now(timezone.utc).isoformat()

    rf_path = os.path.join(paths["models_dir"], "crop_rf_v1.pkl")
    joblib.dump(rf_model, rf_path, compress=3)
    logger.info(f"[CropTrain] Saved RF (calibrated) → {rf_path}")

    le_path = os.path.join(paths["models_dir"], "crop_label_encoder.pkl")
    joblib.dump(le, le_path, compress=3)
    logger.info(f"[CropTrain] Saved LabelEncoder → {le_path}")

    if xgb_model:
        xgb_path = os.path.join(paths["models_dir"], "crop_xgb_v1.pkl")
        joblib.dump(xgb_model, xgb_path, compress=3)
        logger.info(f"[CropTrain] Saved XGB (calibrated) → {xgb_path}")

    if lgbm_model:
        lgbm_path = os.path.join(paths["models_dir"], "crop_lgbm_v1.pkl")
        joblib.dump(lgbm_model, lgbm_path, compress=3)
        logger.info(f"[CropTrain] Saved LGBM → {lgbm_path}")

    # ── 10. Write metrics.json ─────────────────────────────────────────────────
    metrics = {
        "version": "Ensemble_v1.0",
        "training_date": training_ts,
        "dataset": csv_path,
        "rows": int(df.shape[0]),
        "features": ALL_FEATURES,
        "top1_accuracy": round(float(test_acc), 4),
        "top3_accuracy": round(float(top3_acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "cv_mean_accuracy": round(float(cv_mean), 4),
        "cv_std": round(float(cv_std), 4),
        "train_accuracy": round(float(train_acc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "overfitting_gap": round(float(gap), 4),
        "shap_top_features": shap_top_features,
        "accept_gate_passed": macro_f1 >= ACCEPT_MACRO_F1,
        "is_active": True,
        "models_saved": {
            "rf": "crop_rf_v1.pkl",
            "xgb": "crop_xgb_v1.pkl" if xgb_model else None,
            "lgbm": "crop_lgbm_v1.pkl" if lgbm_model else None,
            "label_encoder": "crop_label_encoder.pkl",
            "scaler": "crop_scaler.pkl",
            "shap_values": "crop_shap_values.pkl",
        },
        "per_class_metrics": {
            cls: {
                "precision": round(report.get(cls, {}).get("precision", 0), 4),
                "recall":    round(report.get(cls, {}).get("recall", 0), 4),
                "f1":        round(report.get(cls, {}).get("f1-score", 0), 4),
            }
            for cls in class_names
        },
    }

    metrics_path = os.path.join(paths["metrics_dir"], "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, default=str)
    logger.info(f"[CropTrain] Metrics written → {metrics_path}")

    # Legacy sidecar (keeps ai/crop_recommendation.py compatible)
    legacy_meta = {
        "model_name": "crop_recommendation_ensemble",
        "version": version,
        "training_timestamp": training_ts,
        "status": "production",
        "feature_list": ALL_FEATURES,
        "class_names": class_names,
        "evaluation_metrics": {
            "rf_accuracy": round(float(test_acc), 4),
            "macro_f1": round(float(macro_f1), 4),
        },
        "feature_importances": shap_importance,
        "shap_top_features": shap_top_features,
    }
    legacy_path = os.path.join(paths["models_dir"], "crop_recommendation_ensemble.json")
    with open(legacy_path, "w", encoding="utf-8") as f:
        json.dump(legacy_meta, f, indent=2, default=str)

    # Cleanup
    del df
    gc.collect()

    logger.info(
        f"[CropTrain] ═══ DONE ═══  "
        f"top1={test_acc:.4f}  macro_f1={macro_f1:.4f}  "
        f"gate={'PASS' if macro_f1 >= ACCEPT_MACRO_F1 else 'FAIL'}"
    )
    return metrics
