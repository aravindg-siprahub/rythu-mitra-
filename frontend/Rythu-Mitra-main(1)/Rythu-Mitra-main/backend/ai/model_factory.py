import os
import joblib
import logging
import torch
import tensorflow as tf
from django.conf import settings

logger = logging.getLogger(__name__)

class ModelFactory:
    """
    Factory class to load and manage AI/ML models efficiently.
    Implements singleton pattern where possible to avoid reloading heavy models.
    """
    _instances = {}

    @classmethod
    def get_model(cls, model_name, model_type='sklearn'):
        """
        Retrieves a loaded model or loads it if not present.
        
        Args:
            model_name (str): Name of the model file (without path).
            model_type (str): 'sklearn', 'pytorch', 'tensorflow', 'xgboost'
        """
        if model_name in cls._instances:
            return cls._instances[model_name]

        model_path = os.path.join(settings.BASE_DIR, 'ai', 'models', model_name)
        
        if not os.path.exists(model_path):
            logger.warning(f"Model {model_name} not found locally at {model_path}.")
            # AUTO-HEAL: Create a lightweight model on the fly
            try:
                from .train_models import train_and_save_dummy_model
                logger.info(f"Initiating auto-training for {model_name}...")
                train_and_save_dummy_model(model_name, model_type)
            except ImportError:
                 logger.error("Could not import training module. Continuing without model.")
            except Exception as e:
                logger.error(f"Auto-training failed: {e}")
            
            # Re-check existence
            if not os.path.exists(model_path):
                 logger.error(f"Still checking for {model_name} failed. Returning None.")
                 return None

        try:
            if model_type == 'sklearn' or model_type == 'xgboost':
                model = joblib.load(model_path)
            elif model_type == 'pytorch':
                model = torch.load(model_path, map_location=torch.device('cpu'))
                model.eval()
            elif model_type == 'tensorflow':
                model = tf.keras.models.load_model(model_path)
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            cls._instances[model_name] = model
            logger.info(f"Successfully loaded model: {model_name}")
            return model
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {str(e)}")
            return None

    @staticmethod
    def ensure_model_directory():
        path = os.path.join(settings.BASE_DIR, 'ai', 'models')
        os.makedirs(path, exist_ok=True)
