"""
ml_factory/weather/inference.py — Weather Forecast Inference
=============================================================
Runs rainfall + temperature models separately.
Computes rolling risk score.
"""

import os
import json
import time
import hashlib
import logging
import numpy as np
import joblib

logger = logging.getLogger(__name__)


def risk_level_from_confidence(conf: float) -> str:
    if conf >= 0.80:
        return "Low"
    elif conf >= 0.60:
        return "Medium"
    return "High"


def compute_risk(rolling_rainfall_7d: float, temp: float) -> dict:
    """Compute agricultural weather risk."""
    risks = {"flood_risk": "Low", "drought_risk": "Low", "heat_risk": "Low"}

    if rolling_rainfall_7d > 150:
        risks["flood_risk"] = "High"
    elif rolling_rainfall_7d > 100:
        risks["flood_risk"] = "Medium"

    if rolling_rainfall_7d < 20 and temp > 38:
        risks["drought_risk"] = "High"
    elif rolling_rainfall_7d < 40:
        risks["drought_risk"] = "Medium"

    if temp > 42:
        risks["heat_risk"] = "High"
    elif temp > 38:
        risks["heat_risk"] = "Medium"

    # Overall risk
    risk_levels = list(risks.values())
    if "High" in risk_levels:
        risks["overall_risk"] = "High"
    elif "Medium" in risk_levels:
        risks["overall_risk"] = "Medium"
    else:
        risks["overall_risk"] = "Low"

    return risks


def load_weather_models(models_dir: str) -> dict:
    """Load weather models and feature columns."""
    result = {"rainfall_model": None, "temp_model": None, "feature_columns": []}

    rain_path = os.path.join(models_dir, "weather_rainfall_gb_v1.pkl")
    if os.path.exists(rain_path):
        result["rainfall_model"] = joblib.load(rain_path)
        logger.info("[WeatherInference] Rainfall model loaded.")

    temp_path = os.path.join(models_dir, "weather_temp_gb_v1.pkl")
    if os.path.exists(temp_path):
        result["temp_model"] = joblib.load(temp_path)
        logger.info("[WeatherInference] Temperature model loaded.")

    fc_path = os.path.join(models_dir, "weather_feature_columns.json")
    if os.path.exists(fc_path):
        with open(fc_path) as f:
            result["feature_columns"] = json.load(f)

    return result


def predict_weather(data: dict, weather_assets: dict) -> dict:
    """
    Predict weather conditions.

    Args:
        data: {"district": str, "latitude": float, "longitude": float,
               "current_temp": float, "current_humidity": float,
               "recent_rainfall_7d": float, "month": int}
    """
    t_start = time.monotonic()

    rain_model = weather_assets.get("rainfall_model")
    temp_model = weather_assets.get("temp_model")
    feature_columns = weather_assets.get("feature_columns", [])

    if not rain_model and not temp_model:
        return {
            "status": "error",
            "message": "Weather models not loaded. Run: python manage.py train_kaggle_models --model weather",
            "http_status": 503,
        }

    month = int(data.get("month", 1))
    season_map = {6: 0, 7: 0, 8: 0, 9: 0, 10: 1, 11: 1, 12: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 2}
    season_encoded = season_map.get(month, 2)

    current_temp = float(data.get("current_temp", 25))
    current_humidity = float(data.get("current_humidity", 60))
    recent_rainfall = float(data.get("recent_rainfall_7d", 0))

    # Build feature dict matching training columns
    feat_dict = {
        "month": month,
        "season_encoded": season_encoded,
        "temp_lag_1": current_temp,
        "temp_lag_7": current_temp * 0.98,
        "growing_degree_days": max(0, current_temp - 10),
        "rainfall_lag_7": recent_rainfall / 7 if recent_rainfall > 0 else 0,
        "rolling_rainfall_7d": recent_rainfall,
        "rolling_rainfall_30d": recent_rainfall * 4,  # rough estimate
        "heat_index": current_temp + (0.33 * current_humidity) - 4,
    }
    # Add humidity if used
    for fc in feature_columns:
        if "humidity" in fc.lower() and fc not in feat_dict:
            feat_dict[fc] = current_humidity

    # Build feature vector in training order
    features = []
    for col in feature_columns:
        features.append(float(feat_dict.get(col, 0)))

    X = np.array([features], dtype=np.float32)

    result = {
        "status": "success",
        "district": data.get("district", "unknown"),
        "forecast": {},
    }

    # Predict rainfall
    if rain_model and len(X[0]) > 0:
        try:
            rainfall_pred = float(rain_model.predict(X)[0])
            result["forecast"]["rainfall_mm"] = round(max(0, rainfall_pred), 2)
        except Exception as e:
            logger.error(f"[WeatherInference] Rainfall prediction failed: {e}")
            result["forecast"]["rainfall_mm"] = None

    # Predict temperature (may need different feature set)
    if temp_model:
        try:
            # Remove temp-related cols that would cause leakage
            temp_features = [f for f in feature_columns if "temp" not in f.lower() or "lag" in f.lower()]
            temp_X = np.array([[float(feat_dict.get(c, 0)) for c in temp_features]], dtype=np.float32)
            temp_pred = float(temp_model.predict(temp_X)[0])
            result["forecast"]["temperature_c"] = round(temp_pred, 1)
        except Exception as e:
            logger.error(f"[WeatherInference] Temperature prediction failed: {e}")
            result["forecast"]["temperature_c"] = None

    # Risk scoring
    rainfall_val = result["forecast"].get("rainfall_mm", recent_rainfall)
    temp_val = result["forecast"].get("temperature_c", current_temp)
    risks = compute_risk(rainfall_val, temp_val)
    result["risk"] = risks
    result["risk_level"] = risks["overall_risk"]

    inference_ms = int((time.monotonic() - t_start) * 1000)
    input_hash = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:16]

    result.update({
        "model_version": "GradientBoosting_v1.0",
        "inference_ms": inference_ms,
        "input_hash": input_hash,
        "http_status": 200,
    })

    return result
