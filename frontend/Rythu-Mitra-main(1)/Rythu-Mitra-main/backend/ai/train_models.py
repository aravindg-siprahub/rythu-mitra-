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

def train_and_save_dummy_model(model_name, model_type):
    """
    Trains a lightweight dummy model to ensure the system is functional
    even without real trained weights.
    """
    ModelFactory_dir = os.path.join(settings.BASE_DIR, 'ai', 'models')
    os.makedirs(ModelFactory_dir, exist_ok=True)
    save_path = os.path.join(ModelFactory_dir, model_name)

    logger.info(f"Training dummy model for {model_name} ({model_type})...")

    # Mock Data (N, P, K, Temp, Hum, pH, Rain)
    X = np.random.rand(10, 7)
    # Mock Labels (Rice, Maize, etc)
    y_labels = ['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 
                'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate']
    
    le = LabelEncoder()
    y = le.fit_transform(y_labels)

    if 'label_encoder' in model_name:
        joblib.dump(le, save_path)
        logger.info(f"Saved dummy LabelEncoder to {save_path}")
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
        # Fallback to sklearn if xgboost missing or other type
        clf = RandomForestClassifier(n_estimators=10)
        clf.fit(X, y)
        joblib.dump(clf, save_path)

    logger.info(f"Saved dummy model to {save_path}")
