"""
ml_factory/market/inference.py — Market Price Forecast Inference
================================================================
Per-commodity model lookup. Returns point forecast + prediction intervals.
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


def load_market_models(models_dir: str) -> dict:
    """Scan ai/models/ for market_xgb_*.pkl files. Returns {commodity: {main, lower, upper}}."""
    result = {}
    if not os.path.exists(models_dir):
        return result

    for f in os.listdir(models_dir):
        if f.startswith("market_xgb_") and f.endswith("_v1.pkl"):
            name = f.replace("market_xgb_", "").replace("_v1.pkl", "")
            if name.endswith("_lower"):
                commodity = name.replace("_lower", "")
                result.setdefault(commodity, {})["lower"] = joblib.load(os.path.join(models_dir, f))
            elif name.endswith("_upper"):
                commodity = name.replace("_upper", "")
                result.setdefault(commodity, {})["upper"] = joblib.load(os.path.join(models_dir, f))
            else:
                result.setdefault(name, {})["main"] = joblib.load(os.path.join(models_dir, f))

    # Feature columns
    fc_path = os.path.join(models_dir, "market_feature_columns.json")
    if os.path.exists(fc_path):
        with open(fc_path) as fh:
            result["_feature_columns"] = json.load(fh)

    logger.info(f"[MarketInference] Loaded models for {len([k for k in result if k != '_feature_columns'])} commodities")
    return result


def predict_market(data: dict, market_models: dict) -> dict:
    """
    Predict market prices for a commodity.

    Args:
        data: {"crop_name": str, "market_name": str, "forecast_days": 7|14,
               "current_price": float, ...}
        market_models: loaded from load_market_models()
    """
    t_start = time.monotonic()

    crop_name = data.get("crop_name", "").strip()
    forecast_days = data.get("forecast_days", 7)

    if not crop_name:
        return {"status": "validation_error", "message": "crop_name is required", "http_status": 422}

    safe_name = crop_name.lower().replace(" ", "_").replace("/", "_")
    models = market_models.get(safe_name)
    if not models or "main" not in models:
        available = [k for k in market_models if k != "_feature_columns"]
        return {
            "status": "error",
            "message": f"No model for commodity '{crop_name}'. Available: {available}",
            "http_status": 404,
        }

    main_model = models["main"]
    lower_model = models.get("lower")
    upper_model = models.get("upper")

    # Build feature vector from current data
    # In production, this would come from recent price history
    current_price = float(data.get("current_price", 0))
    month = int(data.get("month", 1))
    quarter = (month - 1) // 3 + 1

    features = np.array([[
        current_price,          # price_lag_7
        current_price * 0.98,   # price_lag_14 (approx)
        current_price * 0.97,   # price_lag_30 (approx)
        current_price,          # rolling_mean_7d
        current_price * 0.99,   # rolling_mean_30d
        0.0,                    # price_pct_change_7d
        month,
        quarter,
        int(data.get("year", 2026)),
        1.0 if month in (4, 5, 10, 11) else 0.0,  # is_harvest_month
        1.0 if month in (10, 11, 12) else 0.0,      # is_festival_season
        current_price * 0.95,   # prev_year_price (approx)
    ]], dtype=np.float32)

    try:
        point_forecast = float(main_model.predict(features)[0])
        lower_bound = float(lower_model.predict(features)[0]) if lower_model else point_forecast * 0.9
        upper_bound = float(upper_model.predict(features)[0]) if upper_model else point_forecast * 1.1
    except Exception as e:
        return {"status": "error", "message": f"Prediction failed: {e}", "http_status": 500}

    # Confidence based on interval width
    interval_width = upper_bound - lower_bound
    if point_forecast > 0:
        confidence = max(0, min(1, 1.0 - (interval_width / point_forecast)))
    else:
        confidence = 0.5

    inference_ms = int((time.monotonic() - t_start) * 1000)
    input_hash = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:16]

    return {
        "status": "success",
        "crop_name": crop_name,
        "forecast_days": forecast_days,
        "point_forecast": round(point_forecast, 2),
        "lower_bound": round(lower_bound, 2),
        "upper_bound": round(upper_bound, 2),
        "confidence": round(confidence, 4),
        "risk_level": risk_level_from_confidence(confidence),
        "model_version": "XGBoost_v1.0",
        "inference_ms": inference_ms,
        "input_hash": input_hash,
        "http_status": 200,
    }
