"""
crop_recommendation.py — Rythu Mitra Crop Recommendation Engine
================================================================
PRD §7.2 requirements implemented:
  - Ensemble (RF + XGB + LGBM) for prediction
  - Per-recommendation explanation via RF feature importances  ← NEW (PRD §7.2 Explainability)
  - Model version from JSON sidecar (PRD §8.7 model registry)  ← NEW
  - Heuristic fallback when models are unavailable
"""
import os
import json
import numpy as np
import logging
from .model_factory import ModelFactory

logger = logging.getLogger(__name__)

# Feature names in the order the model was trained (must match kaggle_trainer.CROP_FEATURES)
CROP_FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

# Human-readable feature labels for farmer-facing explanations
FEATURE_LABELS = {
    'N':           'Nitrogen level',
    'P':           'Phosphorus level',
    'K':           'Potassium level',
    'temperature': 'Temperature',
    'humidity':    'Humidity',
    'ph':          'Soil pH',
    'rainfall':    'Rainfall',
}


class CropRecommendationEngine:
    """
    AI-powered Crop Recommendation Engine — PRD §7.2
    Uses an Ensemble of RandomForest + XGBoost + LightGBM.
    Provides per-recommendation explanations using RF feature importances.
    Model version is sourced from the JSON sidecar (PRD §8.7).
    """

    def __init__(self):
        self.rf_model = ModelFactory.get_model('crop_rf_v1.pkl', 'sklearn')
        self.xgb_model = ModelFactory.get_model('crop_xgb_v1.pkl', 'xgboost')
        self.lgbm_model = ModelFactory.get_model('crop_lgbm_v1.pkl', 'sklearn')
        self.label_encoder = ModelFactory.get_model('crop_label_encoder.pkl', 'sklearn')

        # Ensemble soft-vote weights
        self.weights = {'rf': 0.4, 'xgb': 0.3, 'lgbm': 0.3}

        # Load model metadata from JSON sidecar (PRD §8.7)
        self._model_meta = self._load_model_metadata()
        self._model_version = self._model_meta.get('version', 'dummy_v0')
        self._feature_importances = self._model_meta.get('feature_importances', {})

    # ── Public API ────────────────────────────────────────────────────────────
    def predict(self, data: dict) -> dict:
        """
        Predict best crops based on soil/climate parameters.

        Args:
            data: {
                'N': float, 'P': float, 'K': float,
                'temperature': float, 'humidity': float,
                'ph': float, 'rainfall': float
            }

        Returns:
            PRD §7.2 response schema — recommendations with explanation,
            model_version, and used_models list.
        """
        try:
            features = self._build_feature_vector(data)
            preds = self._run_ensemble(features)

            if not preds:
                logger.warning("[CropEngine] No ML models loaded. Using heuristic fallback.")
                return self._heuristic_fallback(data)

            # Soft-vote across available models
            final_proba = self._soft_vote(preds)

            if self.label_encoder is None:
                return self._heuristic_fallback(data)

            top_3_indices = final_proba.argsort()[-3:][::-1]
            classes = self.label_encoder.classes_

            recommendations = []
            for idx in top_3_indices:
                crop_name = classes[idx]
                confidence = round(float(final_proba[idx]) * 100, 2)
                explanation = self._build_explanation(data)
                recommendations.append({
                    'crop': crop_name,
                    'confidence': confidence,
                    'explanation': explanation,       # PRD §7.2 Explainability
                })

            return {
                'status': 'success',
                'recommendations': recommendations,
                'meta': {
                    'model_version': self._model_version,   # PRD §8.7
                    'used_models': list(preds.keys()),
                    'ensemble_weights': self.weights,
                    'input_features': {
                        k: data.get(k) for k in CROP_FEATURES
                    },
                },
            }

        except Exception as e:
            logger.error(f"[CropEngine] Prediction error: {e}", exc_info=True)
            return {
                'status': 'error',
                'message': str(e),
                'fallback': self._heuristic_fallback(data),
            }

    # ── Private helpers ───────────────────────────────────────────────────────
    def _build_feature_vector(self, data: dict):
        """Build numpy feature array in the same order as training (CROP_FEATURES)."""
        defaults = {
            'N': 0.0, 'P': 0.0, 'K': 0.0,
            'temperature': 25.0, 'humidity': 60.0,
            'ph': 7.0, 'rainfall': 100.0,
        }
        vals = [float(data.get(f, defaults[f])) for f in CROP_FEATURES]
        return np.array([vals])

    def _run_ensemble(self, features) -> dict:
        """Run prediction on all available models. Returns {model_key: proba_array}."""
        preds = {}
        if self.rf_model:
            try:
                preds['rf'] = self.rf_model.predict_proba(features)[0]
            except Exception as e:
                logger.warning(f"[CropEngine] RF predict failed: {e}")
        if self.xgb_model:
            try:
                preds['xgb'] = self.xgb_model.predict_proba(features)[0]
            except Exception as e:
                logger.warning(f"[CropEngine] XGB predict failed: {e}")
        if self.lgbm_model:
            try:
                preds['lgbm'] = self.lgbm_model.predict_proba(features)[0]
            except Exception as e:
                logger.warning(f"[CropEngine] LGBM predict failed: {e}")
        return preds

    def _soft_vote(self, preds: dict):
        """Weighted average of probability arrays across ensemble models."""
        base = np.zeros_like(next(iter(preds.values())))
        for key, prob in preds.items():
            base += prob * self.weights.get(key, 0.33)
        return base

    def _build_explanation(self, data: dict) -> dict:
        """
        Build a farmer-facing explanation using RF feature importances.
        PRD §7.2: 'Per-recommendation explanation (key factors, confidence, caveats)
                   in farmer-facing language.'

        Returns:
            {
                'top_factors': [{'feature': str, 'label': str, 'importance': float, 'value': float}],
                'caveats': str
            }
        """
        if not self._feature_importances:
            return {
                'top_factors': [],
                'caveats': 'Explanation not available — model trained without feature importance data.',
            }

        # Sort features by global importance (from training sidecar)
        sorted_features = sorted(
            self._feature_importances.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        top_factors = []
        for feat, importance in sorted_features[:3]:   # top 3 factors
            top_factors.append({
                'feature': feat,
                'label': FEATURE_LABELS.get(feat, feat),
                'importance': round(importance, 4),
                'value': data.get(feat),
            })

        # Caveat: note if key inputs were missing/default
        missing = [f for f in CROP_FEATURES if data.get(f) is None]
        caveat = (
            f"Note: {', '.join(missing)} used default values — provide actual readings for better accuracy."
            if missing else
            "All input parameters provided — high confidence recommendation."
        )

        return {'top_factors': top_factors, 'caveats': caveat}

    def _load_model_metadata(self) -> dict:
        """Load JSON sidecar produced by kaggle_trainer.write_model_metadata() (PRD §8.7)."""
        try:
            from django.conf import settings
            meta_path = os.path.join(
                settings.BASE_DIR, 'ai', 'models', 'crop_recommendation_ensemble.json'
            )
            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"[CropEngine] Could not load model metadata: {e}")
        return {}

    # ── Heuristic fallback (unchanged from original) ──────────────────────────
    def _heuristic_fallback(self, data: dict) -> dict:
        """
        Rule-based fallback when ML models are offline/initializing.
        Based on FAO agricultural standards.
        Run: python manage.py train_kaggle_models --model crop to replace this.
        """
        n, p, k = data.get('N', 0), data.get('P', 0), data.get('K', 0)
        ph = data.get('ph', 7)
        rain = data.get('rainfall', 100)

        crops = []
        if n > 120:
            crops.append(('Cotton', 95))
        elif n > 80:
            crops.append(('Rice', 92))
        else:
            crops.append(('Kidneybeans', 85))

        if k > 50 and rain < 80:
            crops.append(('Chickpea', 88))

        if rain > 200:
            crops.append(('Rice', 98))
            crops.append(('Coconut', 90))
        elif rain < 50:
            crops.append(('Watermelon', 92))

        if ph < 5.5:
            crops.append(('Tea', 85))
        elif ph > 7.5:
            crops.append(('Barley', 80))

        unique_crops = {c[0]: c[1] for c in crops}
        sorted_crops = sorted(unique_crops.items(), key=lambda x: x[1], reverse=True)[:3]

        return {
            'status': 'success',
            'model_version': 'heuristic_fallback',
            'note': 'Generated via Expert Heuristics — train real models with: python manage.py train_kaggle_models --model crop',
            'recommendations': [
                {
                    'crop': c[0],
                    'confidence': c[1],
                    'explanation': {
                        'top_factors': [],
                        'caveats': 'Heuristic mode — no feature importance available.',
                    },
                }
                for c in sorted_crops
            ],
        }
