"""
Kaggle Trainer — Rythu Mitra AI Training Pipeline
===================================================
Trains ML models from real Kaggle datasets (or local CSV files).
Writes model artifacts + JSON sidecar metadata to ai/models/.

Datasets:
  - Crop Recommendation: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
    (Crop_recommendation.csv — 2200 rows, features: N, P, K, temperature, humidity, ph, rainfall, label)
  - Disease Detection: manual — PlantVillage dataset (image-based, handled separately)

Usage:
    python manage.py train_kaggle_models --model crop --csv /path/to/Crop_recommendation.csv
    python manage.py train_kaggle_models --model crop      # uses datasets/Crop_recommendation.csv
"""
import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone

from django.conf import settings

logger = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(settings.BASE_DIR, "ai", "models")
DATASETS_DIR = os.path.join(settings.BASE_DIR, "ai", "datasets")

CROP_CSV_DEFAULT = os.path.join(DATASETS_DIR, "Crop_recommendation.csv")
CROP_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
CROP_LABEL_COL = "label"


# ── Metadata Sidecar (PRD §8.7 Model Registry) ───────────────────────────────
def write_model_metadata(model_name: str, metadata: dict):
    """
    Write a JSON sidecar file alongside the model artifact.
    This satisfies PRD §8.7 model lifecycle recording without a separate registry service.

    Sidecar: ai/models/<model_name>.json
    Schema:
        model_name, version, training_timestamp, feature_list,
        evaluation_metrics, dataset_info, status
    """
    os.makedirs(MODELS_DIR, exist_ok=True)
    meta_path = os.path.join(MODELS_DIR, f"{model_name}.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, default=str)
    logger.info(f"[ModelRegistry] Wrote sidecar metadata -> {meta_path}")
    return meta_path


def read_model_metadata(model_name: str) -> dict:
    """Read the JSON sidecar for a model. Returns {} if not found."""
    meta_path = os.path.join(MODELS_DIR, f"{model_name}.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            return json.load(f)
    return {}


# ── Crop Recommendation Training ──────────────────────────────────────────────
def train_crop_recommendation(csv_path: str = None, version: str = None):
    """
    Train an ensemble (Random Forest + XGBoost + LightGBM) on the
    Kaggle Crop Recommendation Dataset.

    Args:
        csv_path: Path to Crop_recommendation.csv. Defaults to CROP_CSV_DEFAULT.
        version: Version string. Auto-generated if not provided.

    Returns:
        dict with evaluation metrics and saved artifact paths.
    """
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report

    csv_path = csv_path or CROP_CSV_DEFAULT
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(DATASETS_DIR, exist_ok=True)

    # ── 1. Load dataset ───────────────────────────────────────────────────────
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Crop dataset not found at {csv_path}.\n"
            "Download from: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset\n"
            "Save as: backend/ai/datasets/Crop_recommendation.csv"
        )

    logger.info(f"[CropTrainer] Loading dataset from {csv_path} ...")
    df = pd.read_csv(csv_path)

    # Validate expected columns
    missing_cols = [c for c in CROP_FEATURES + [CROP_LABEL_COL] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset missing columns: {missing_cols}. Found: {list(df.columns)}")

    logger.info(f"[CropTrainer] Dataset loaded. Shape: {df.shape}. Classes: {df[CROP_LABEL_COL].nunique()}")

    # ── 2. Prepare features ───────────────────────────────────────────────────
    X = df[CROP_FEATURES].values
    le = LabelEncoder()
    y = le.fit_transform(df[CROP_LABEL_COL].values)
    class_names = list(le.classes_)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── 3. Train Random Forest ────────────────────────────────────────────────
    logger.info("[CropTrainer] Training Random Forest ...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test))
    logger.info(f"[CropTrainer] RF Accuracy: {rf_acc:.4f}")

    # ── 4. Train XGBoost (optional) ───────────────────────────────────────────
    xgb_acc = None
    xgb_model = None
    try:
        import xgboost as xgb_lib
        logger.info("[CropTrainer] Training XGBoost ...")
        xgb_model = xgb_lib.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1,
        )
        xgb_model.fit(X_train, y_train)
        xgb_acc = accuracy_score(y_test, xgb_model.predict(X_test))
        logger.info(f"[CropTrainer] XGB Accuracy: {xgb_acc:.4f}")
    except ImportError:
        logger.warning("[CropTrainer] xgboost not installed. Skipping XGB model.")

    # ── 5. Train LightGBM (optional) ──────────────────────────────────────────
    lgbm_acc = None
    lgbm_model = None
    try:
        import lightgbm as lgb_lib
        logger.info("[CropTrainer] Training LightGBM ...")
        lgbm_model = lgb_lib.LGBMClassifier(
            n_estimators=200,
            learning_rate=0.1,
            num_leaves=31,
            random_state=42,
            n_jobs=-1,
            verbose=-1,
        )
        lgbm_model.fit(X_train, y_train)
        lgbm_acc = accuracy_score(y_test, lgbm_model.predict(X_test))
        logger.info(f"[CropTrainer] LGBM Accuracy: {lgbm_acc:.4f}")
    except ImportError:
        logger.warning("[CropTrainer] lightgbm not installed. Skipping LGBM model.")

    # ── 6. Classification report (RF as primary evaluator) ────────────────────
    report = classification_report(
        y_test, rf.predict(X_test), target_names=class_names, output_dict=True
    )
    macro_f1 = report.get("macro avg", {}).get("f1-score", 0.0)

    # ── 7. Feature importances (RF) ────────────────────────────────────────────
    feature_importances = dict(zip(CROP_FEATURES, rf.feature_importances_.tolist()))

    # ── 8. Save artifacts ─────────────────────────────────────────────────────
    version = version or f"v{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    training_timestamp = datetime.now(timezone.utc).isoformat()

    saved_paths = {}

    rf_path = os.path.join(MODELS_DIR, "crop_rf_v1.pkl")
    joblib.dump(rf, rf_path)
    saved_paths["rf"] = rf_path
    logger.info(f"[CropTrainer] Saved RF → {rf_path}")

    le_path = os.path.join(MODELS_DIR, "crop_label_encoder.pkl")
    joblib.dump(le, le_path)
    saved_paths["label_encoder"] = le_path
    logger.info(f"[CropTrainer] Saved LabelEncoder → {le_path}")

    if xgb_model is not None:
        xgb_path = os.path.join(MODELS_DIR, "crop_xgb_v1.pkl")
        joblib.dump(xgb_model, xgb_path)
        saved_paths["xgb"] = xgb_path
        logger.info(f"[CropTrainer] Saved XGB → {xgb_path}")

    if lgbm_model is not None:
        lgbm_path = os.path.join(MODELS_DIR, "crop_lgbm_v1.pkl")
        joblib.dump(lgbm_model, lgbm_path)
        saved_paths["lgbm"] = lgbm_path
        logger.info(f"[CropTrainer] Saved LGBM → {lgbm_path}")

    # ── 9. Write JSON sidecar (PRD §8.7 model registry) ──────────────────────
    metadata = {
        "model_name": "crop_recommendation_ensemble",
        "version": version,
        "training_timestamp": training_timestamp,
        "status": "production",
        "feature_list": CROP_FEATURES,
        "label_col": CROP_LABEL_COL,
        "class_names": class_names,
        "dataset_info": {
            "path": csv_path,
            "total_rows": len(df),
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "num_classes": len(class_names),
        },
        "evaluation_metrics": {
            "rf_accuracy": round(rf_acc, 4),
            "xgb_accuracy": round(xgb_acc, 4) if xgb_acc else None,
            "lgbm_accuracy": round(lgbm_acc, 4) if lgbm_acc else None,
            "macro_f1": round(macro_f1, 4),
        },
        "feature_importances": feature_importances,
        "saved_artifacts": saved_paths,
        "prd_requirement": "§7.2 Crop Recommendation — versioning, evaluation, explainability",
    }
    write_model_metadata("crop_recommendation_ensemble", metadata)

    xgb_str = f"{xgb_acc:.4f}" if xgb_acc else "N/A"
    lgbm_str = f"{lgbm_acc:.4f}" if lgbm_acc else "N/A"
    logger.info(
        f"[CropTrainer] DONE. RF={rf_acc:.4f}  "
        f"XGB={xgb_str}  LGBM={lgbm_str}"
    )
    return metadata
