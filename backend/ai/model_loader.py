"""
ai/model_loader.py — Singleton Model Loader
============================================
Loads ALL ML models ONCE at Django startup.
Never per-request. Called from ai/apps.py ready().

If a model file is missing → returns structured error, never fake prediction.
"""

import os
import logging
import joblib

logger = logging.getLogger(__name__)


class ModelLoader:
    """Singleton model loader — loads .pkl and .pt files once."""
    _instance = None
    _models = {}
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get(cls, model_name: str):
        """Get a loaded model by filename (e.g. 'crop_rf_v1.pkl')."""
        if model_name in cls._models:
            return cls._models[model_name]
        # Not loaded — try loading now
        return cls._load_single(model_name)

    @classmethod
    def _load_single(cls, model_name: str):
        """Load a single model file on demand."""
        from django.conf import settings
        path = os.path.join(settings.BASE_DIR, "ai", "models", model_name)
        if not os.path.exists(path):
            logger.warning(f"[ModelLoader] Model not found: {path}")
            return None
        try:
            if model_name.endswith(".pkl"):
                model = joblib.load(path)
            elif model_name.endswith(".pt"):
                import torch
                model = torch.load(path, map_location="cpu", weights_only=True)
            else:
                logger.error(f"[ModelLoader] Unsupported format: {model_name}")
                return None
            cls._models[model_name] = model
            logger.info(f"[ModelLoader] Loaded: {model_name}")
            return model
        except Exception as e:
            logger.error(f"[ModelLoader] Failed to load {model_name}: {e}")
            return None

    @classmethod
    def load_all(cls):
        """Load all known production models at once (called from AppConfig.ready)."""
        if cls._initialized:
            return

        from django.conf import settings
        models_dir = os.path.join(settings.BASE_DIR, "ai", "models")

        if not os.path.exists(models_dir):
            logger.warning(f"[ModelLoader] Models directory not found: {models_dir}")
            cls._initialized = True
            return

        # Crop models
        crop_files = [
            "crop_rf_v1.pkl", "crop_xgb_v1.pkl", "crop_lgbm_v1.pkl",
            "crop_label_encoder.pkl", "crop_scaler.pkl", "crop_shap_values.pkl",
        ]
        for f in crop_files:
            cls._load_single(f)

        # Disease model assets (loaded separately via disease inference module)
        # Market models (loaded dynamically by commodity name)
        # Weather models
        for f in ["weather_rainfall_gb_v1.pkl", "weather_temp_gb_v1.pkl"]:
            cls._load_single(f)

        loaded = len(cls._models)
        cls._initialized = True
        logger.info(f"[ModelLoader] ═══ Startup complete: {loaded} models loaded ═══")

    @classmethod
    def get_crop_models(cls) -> dict:
        """Get all crop models as a dict for inference."""
        return {
            "rf":            cls.get("crop_rf_v1.pkl"),
            "xgb":           cls.get("crop_xgb_v1.pkl"),
            "lgbm":          cls.get("crop_lgbm_v1.pkl"),
            "label_encoder": cls.get("crop_label_encoder.pkl"),
            "shap_values":   cls.get("crop_shap_values.pkl"),
        }

    @classmethod
    def is_initialized(cls) -> bool:
        return cls._initialized

    @classmethod
    def status(cls) -> dict:
        """Return model loading status for health checks."""
        return {
            "initialized": cls._initialized,
            "models_loaded": list(cls._models.keys()),
            "count": len(cls._models),
        }
