"""
ml_factory/crop/inference.py — Crop Recommendation Inference
============================================================
Loaded ONCE at Django startup via ModelLoader.
All API endpoints call this module — never train.py.

Returns top-3 crop recommendations with:
  - confidence (calibrated probability)
  - risk_level (Low/Medium/High from confidence)
  - top SHAP features
  - farmer_advisory (text from OpenRouter)
"""

import os
import gc
import json
import time
import hashlib
import logging
import numpy as np

logger = logging.getLogger(__name__)

ORIGINAL_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
DERIVED_FEATURES  = ["np_ratio", "nk_ratio", "pk_ratio"]
ALL_FEATURES      = ORIGINAL_FEATURES + DERIVED_FEATURES

# Strict input validation ranges (PRD §API layer)
INPUT_RANGES = {
    "N":           (0,    140),
    "P":           (5,    145),
    "K":           (5,    205),
    "ph":          (3.5,  10.0),
    "temperature": (8,    44),
    "humidity":    (14,   100),
    "rainfall":    (20,   300),
}

FEATURE_LABELS = {
    "N":           "Nitrogen",
    "P":           "Phosphorus",
    "K":           "Potassium",
    "temperature": "Temperature (°C)",
    "humidity":    "Humidity (%)",
    "ph":          "Soil pH",
    "rainfall":    "Rainfall (mm/year)",
    "np_ratio":    "N/P Ratio",
    "nk_ratio":    "N/K Ratio",
    "pk_ratio":    "P/K Ratio",
}


def risk_level_from_confidence(conf: float) -> str:
    """PRD §API layer — consistent risk level across all models."""
    if conf >= 0.80:
        return "Low"
    elif conf >= 0.60:
        return "Medium"
    return "High"


def validate_input(data: dict) -> tuple[bool, dict]:
    """Returns (is_valid, errors_dict)."""
    errors = {}
    for field, (lo, hi) in INPUT_RANGES.items():
        val = data.get(field)
        if val is None:
            errors[field] = f"Required field missing."
            continue
        try:
            val = float(val)
        except (TypeError, ValueError):
            errors[field] = f"Must be a number."
            continue
        if not (lo <= val <= hi):
            errors[field] = f"Must be between {lo} and {hi}."
    return (len(errors) == 0, errors)


def build_feature_vector(data: dict) -> np.ndarray:
    """Build 10-feature vector with derived features."""
    n = float(data.get("N", 0))
    p = float(data.get("P", 0))
    k = float(data.get("K", 0))
    t = float(data.get("temperature", 25))
    h = float(data.get("humidity", 60))
    ph = float(data.get("ph", 7))
    r = float(data.get("rainfall", 100))

    np_ratio = n / (p + 1)
    nk_ratio = n / (k + 1)
    pk_ratio = p / (k + 1)

    return np.array([[n, p, k, t, h, ph, r, np_ratio, nk_ratio, pk_ratio]], dtype=np.float32)


def predict(data: dict, models: dict) -> dict:
    """
    Run ensemble crop prediction.

    Args:
        data: raw input dict from API
        models: {
            'rf': loaded calibrated RF,
            'xgb': loaded calibrated XGB (optional),
            'lgbm': loaded LGBM (optional),
            'label_encoder': LabelEncoder,
            'shap_values': SHAP dict (optional),
        }

    Returns:
        PRD-spec response dict
    """
    t_start = time.monotonic()

    # Input hash for telemetry
    input_hash = hashlib.sha256(
        json.dumps({k: data.get(k) for k in ORIGINAL_FEATURES}, sort_keys=True).encode()
    ).hexdigest()[:16]

    is_valid, errors = validate_input(data)
    if not is_valid:
        return {
            "status": "validation_error",
            "errors": errors,
            "http_status": 422,
        }

    rf       = models.get("rf")
    xgb      = models.get("xgb")
    lgbm     = models.get("lgbm")
    le       = models.get("label_encoder")
    shap_pkg = models.get("shap_values") or {}

    if not rf or not le:
        return {
            "status": "error",
            "message": "Crop models not loaded. Run: python manage.py train_kaggle_models --model crop",
            "http_status": 503,
        }

    features = build_feature_vector(data)

    # Ensemble soft vote
    proba = np.zeros(len(le.classes_), dtype=np.float64)
    weight_sum = 0.0
    try:
        proba += rf.predict_proba(features)[0] * 0.4
        weight_sum += 0.4
    except Exception as e:
        logger.error(f"[CropInference] RF predict failed: {e}")

    if xgb:
        try:
            proba += xgb.predict_proba(features)[0] * 0.3
            weight_sum += 0.3
        except Exception as e:
            logger.warning(f"[CropInference] XGB predict failed: {e}")

    if lgbm:
        try:
            proba += lgbm.predict_proba(features)[0] * 0.3
            weight_sum += 0.3
        except Exception as e:
            logger.warning(f"[CropInference] LGBM predict failed: {e}")

    if weight_sum > 0:
        proba /= weight_sum

    top3_idx = np.argsort(proba)[-3:][::-1]
    classes  = le.classes_

    # SHAP importance from stored values
    shap_importance = shap_pkg.get("importance", {})
    top_shap_feats  = shap_pkg.get("top_features", list(shap_importance.keys())[:5])

    recommendations = []
    for rank, idx in enumerate(top3_idx, start=1):
        conf = float(proba[idx])
        crop = str(classes[idx])
        recommendations.append({
            "rank": rank,
            "crop": crop,
            "confidence": round(conf, 4),
            "confidence_pct": round(conf * 100, 1),
            "risk_level": risk_level_from_confidence(conf),
            "explanation": {
                "top_features": top_shap_feats[:3],
                "shap_values": {
                    f: round(float(v), 4)
                    for f, v in list(shap_importance.items())[:5]
                },
                "farmer_advisory": None,   # filled by OpenRouter in views.py
            },
        })

    inference_ms = int((time.monotonic() - t_start) * 1000)

    return {
        "status": "success",
        "recommendations": recommendations,
        "model_version": "Ensemble_v1.0",
        "inference_ms": inference_ms,
        "input_hash": input_hash,
        "shap_top_features": top_shap_feats[:3],
        "http_status": 200,
    }
