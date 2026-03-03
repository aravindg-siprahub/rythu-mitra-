"""
train_models.py — Rythu Mitra AI Model Training
================================================

Two training paths:
  1. AUTO-HEAL (dummy)  — train_and_save_dummy_model()
     Called automatically by ModelFactory when no model file exists.
     Uses random noise. For dev/boot resilience only.

  2. REAL TRAINING       — train_crop_from_csv()
     Called by the management command: python manage.py train_kaggle_models
     Uses real Kaggle Crop Recommendation Dataset CSV.
     Produces production-quality artifacts + JSON sidecar (PRD §8.7).
"""
import os
import joblib
import numpy as np
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
try:
    import xgboost as xgb
except ImportError:
    xgb = None
from django.conf import settings

logger = logging.getLogger(__name__)

# ── Path helpers ──────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(settings.BASE_DIR, 'ai', 'models')
DATASETS_DIR = os.path.join(settings.BASE_DIR, 'ai', 'datasets')
CROP_CSV_DEFAULT = os.path.join(DATASETS_DIR, 'Crop_recommendation.csv')
CROP_FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']


# ── Path 1: AUTO-HEAL dummy model (keep as-is for ModelFactory resilience) ────
def train_and_save_dummy_model(model_name, model_type):
    """
    Trains a lightweight dummy model to ensure the system is functional
    even without real trained weights.

    NOTE: This uses random data and is ONLY for bootstrapping / dev resilience.
    For production training use: python manage.py train_kaggle_models --model crop
    """
    os.makedirs(MODELS_DIR, exist_ok=True)
    save_path = os.path.join(MODELS_DIR, model_name)

    logger.info(f"[AutoHeal] Training dummy model for {model_name} ({model_type})...")

    # Mock Data (N, P, K, Temp, Hum, pH, Rain)
    X = np.random.rand(10, 7)
    # Mock Labels
    y_labels = ['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas',
                'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate']

    le = LabelEncoder()
    y = le.fit_transform(y_labels)

    if 'label_encoder' in model_name:
        joblib.dump(le, save_path)
        logger.info(f"[AutoHeal] Saved dummy LabelEncoder → {save_path}")
        return

    if model_type == 'sklearn':
        clf = RandomForestClassifier(n_estimators=10)
        clf.fit(X, y)
        joblib.dump(clf, save_path)
    elif model_type == 'xgboost' and xgb:
        clf = xgb.XGBClassifier(n_estimators=10, eval_metric='mlogloss')
        clf.fit(X, y)
        joblib.dump(clf, save_path)
    else:
        clf = RandomForestClassifier(n_estimators=10)
        clf.fit(X, y)
        joblib.dump(clf, save_path)

    logger.info(f"[AutoHeal] Saved dummy model → {save_path}")


# ── Path 2: REAL training from Kaggle CSV ─────────────────────────────────────
def train_crop_from_csv(csv_path: str = None, version: str = None) -> dict:
    """
    Convenience wrapper — delegates to kaggle_trainer.train_crop_recommendation().

    Args:
        csv_path: Path to Crop_recommendation.csv. Defaults to CROP_CSV_DEFAULT.
        version: Version string. Auto-generated from timestamp if None.

    Returns:
        dict: Training metadata (matches JSON sidecar schema in PRD §8.7).

    Usage:
        from ai.train_models import train_crop_from_csv
        metadata = train_crop_from_csv()
    """
    from ai.kaggle_trainer import train_crop_recommendation
    return train_crop_recommendation(csv_path=csv_path, version=version)
