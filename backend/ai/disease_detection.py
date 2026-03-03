"""
disease_detection.py — Rythu Mitra Disease Detection Engine
============================================================
PRD §7.3 requirements implemented:
  - Full PlantVillage 38-class list (was 17)               ← Phase 2 fix
  - Structured severity scoring (Low/Moderate/High/Critical)← Phase 2 fix
  - Model version from JSON sidecar (PRD §8.7)              ← Phase 2 fix
  - Confidence-aware treatment recommendations
  - Heuristic/mock fallback when model weights unavailable
"""
import os
import json
import logging
import io

import torch
import torchvision.transforms as transforms
from PIL import Image

from .model_factory import ModelFactory

logger = logging.getLogger(__name__)


# ── Full PlantVillage 38-class list (PRD §7.3) ────────────────────────────────
# Source: https://www.kaggle.com/datasets/emmarex/plantdisease
# Previously only 17 classes — now complete.
PLANT_VILLAGE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# Severity classification — structured rules (PRD §7.3 "Labels, confidence, severity")
# Keys are substrings matched case-insensitively against the disease label.
SEVERITY_RULES = {
    # Critical — immediate action required
    "Late_blight": "Critical",
    "Haunglongbing": "Critical",
    "Yellow_Leaf_Curl_Virus": "Critical",
    "mosaic_virus": "Critical",
    # High
    "Black_rot": "High",
    "Esca_(Black_Measles)": "High",
    "Septoria": "High",
    "Bacterial_spot": "High",
    "Leaf_blight": "High",
    "Leaf_scorch": "High",
    # Moderate
    "Early_blight": "Moderate",
    "Common_rust": "Moderate",
    "Cercospora": "Moderate",
    "Gray_leaf_spot": "Moderate",
    "Powdery_mildew": "Moderate",
    "Apple_scab": "Moderate",
    "Cedar_apple_rust": "Moderate",
    "Spider_mites": "Moderate",
    "Target_Spot": "Moderate",
    "Leaf_Mold": "Moderate",
}

# Treatment database (expanded for common diseases)
TREATMENT_DB = {
    "Tomato___Early_blight": "Apply Copper-based fungicides (Mancozeb 75% WP). Improve air circulation. Remove infected leaves.",
    "Tomato___Late_blight": "Apply Metalaxyl + Mancozeb (Ridomil Gold). Destroy heavily infected plants. Avoid overhead irrigation.",
    "Tomato___Bacterial_spot": "Apply Copper hydroxide (Kocide). Remove infected material. Avoid working in wet conditions.",
    "Tomato___Leaf_Mold": "Improve ventilation. Apply Chlorothalonil or Copper fungicide. Reduce humidity below 85%.",
    "Tomato___Septoria_leaf_spot": "Remove lower infected leaves. Apply Chlorothalonil. Mulch to reduce soil splash.",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Apply Abamectin or Neem oil. Increase humidity. Introduce predatory mites.",
    "Tomato___Target_Spot": "Apply Azoxystrobin or Chlorothalonil. Improve drainage and spacing.",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Control Whitefly vectors immediately. Remove infected plants. Use resistant varieties next crop.",
    "Tomato___Tomato_mosaic_virus": "Remove and destroy infected plants. Disinfect tools. Plant virus-resistant varieties.",
    "Potato___Early_blight": "Apply Mancozeb 75 WP or Chlorothalonil. Ensure adequate soil fertility. Rotate crops.",
    "Potato___Late_blight": "Apply Metalaxyl + Mancozeb (Ridomil). Destroy infected tubers. Avoid planting in waterlogged fields.",
    "Corn_(maize)___Common_rust_": "Plant resistant hybrids. Apply Triazole fungicides if infection is severe.",
    "Corn_(maize)___Northern_Leaf_Blight": "Apply Propiconazole. Use resistant varieties. Rotate crops.",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Improve spacing for airflow. Apply Strobilurin fungicide.",
    "Apple___Apple_scab": "Apply Captan or Myclobutanil at green tip stage. Rake and destroy fallen leaves.",
    "Apple___Black_rot": "Prune infected wood. Apply Captan. Remove mummified fruits.",
    "Apple___Cedar_apple_rust": "Remove nearby cedar trees if possible. Apply Myclobutanil before infection.",
    "Grape___Black_rot": "Apply Mancozeb or Myclobutanil. Remove infected mummies. Improve airflow.",
    "Grape___Esca_(Black_Measles)": "Prune infected wood. No curative treatment — manage wound protection.",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Apply Copper-based fungicides. Remove infected debris.",
    "Orange___Haunglongbing_(Citrus_greening)": "No cure. Remove infected trees. Control Asian Citrus Psyllid immediately. Replant with certified disease-free trees.",
    "Squash___Powdery_mildew": "Apply Sulfur-based fungicide or Potassium bicarbonate. Improve air circulation.",
    "Cherry_(including_sour)___Powdery_mildew": "Apply Myclobutanil or Sulfur. Prune for airflow.",
    "Strawberry___Leaf_scorch": "Apply Captan. Remove infected leaves. Avoid overhead watering.",
    "Peach___Bacterial_spot": "Apply Copper bactericide. Avoid overhead irrigation.",
}


class DiseaseDetectionEngine:
    """
    Disease Detection Engine — PRD §7.3
    Uses EfficientNet-B4 (fine-tuned on PlantVillage) for classification.
    Falls back to mock inference in dev/staging when model weights are absent.
    Provides structured severity (Low/Moderate/High/Critical) and treatment.
    Model version sourced from JSON sidecar (PRD §8.7).
    """

    def __init__(self):
        self.model = ModelFactory.get_model('efficientnet_b7_plant_disease.pth', 'pytorch')
        self.class_names = PLANT_VILLAGE_CLASSES   # Full 38-class list

        # Standard ImageNet normalization for EfficientNet
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])

        # Model metadata
        self._model_meta = self._load_model_metadata()
        self._model_version = self._model_meta.get('version', 'efficientnet_b4_unversioned')

    # ── Public API ────────────────────────────────────────────────────────────
    def predict_from_image(self, image_bytes: bytes) -> dict:
        """
        Diagnose crop disease from raw image bytes.

        Returns:
            PRD §7.3 schema — disease label, confidence, severity, actions, model_version.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            tensor = self.transform(image).unsqueeze(0)

            if self.model:
                device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                self.model.to(device)
                tensor = tensor.to(device)

                with torch.no_grad():
                    outputs = self.model(tensor)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    confidence, predicted_idx = torch.max(probabilities, 1)

                predicted_class = self.class_names[predicted_idx.item()]
                conf_score = round(confidence.item() * 100, 2)
                inference_mode = "model"
            else:
                # Mock inference for dev — fixed stable result
                logger.warning("[DiseaseEngine] Model weights not found. Mock inference active.")
                logger.warning("  → To train: python manage.py train_kaggle_models --model disease")
                predicted_class = "Tomato___Early_blight"
                conf_score = 96.5
                inference_mode = "mock"

            severity = self._classify_severity(predicted_class, conf_score)
            is_healthy = "healthy" in predicted_class.lower()

            return {
                'disease': predicted_class,
                'confidence': conf_score,
                'severity': severity,
                'is_healthy': is_healthy,
                'recommendation': self._get_treatment(predicted_class) if not is_healthy else "Crop appears healthy. Continue regular monitoring.",
                'meta': {
                    'model_version': self._model_version,   # PRD §8.7
                    'inference_mode': inference_mode,
                    'num_classes': len(self.class_names),
                },
            }

        except Exception as e:
            logger.error(f"[DiseaseEngine] Detection error: {e}", exc_info=True)
            return {'error': str(e)}

    # ── Private helpers ───────────────────────────────────────────────────────
    def _classify_severity(self, disease_name: str, confidence: float) -> str:
        """
        Structured severity scoring — PRD §7.3 'Labels, confidence, severity'.
        Uses SEVERITY_RULES mapping; downgrades one level if confidence < 60%.
        """
        if "healthy" in disease_name.lower():
            return "None"

        severity = "Low"   # default
        for keyword, level in SEVERITY_RULES.items():
            if keyword.lower() in disease_name.lower():
                severity = level
                break

        # Low-confidence predictions get downgraded one level
        if confidence < 60.0:
            downgrade = {"Critical": "High", "High": "Moderate", "Moderate": "Low", "Low": "Low"}
            severity = downgrade.get(severity, severity)

        return severity

    def _get_treatment(self, disease_name: str) -> str:
        """Return treatment recommendation from database or a generic fallback."""
        return TREATMENT_DB.get(
            disease_name,
            "Consult a local agronomist for specific diagnosis and chemical application. "
            "General: isolate affected plants, improve airflow, ensure proper drainage.",
        )

    def _load_model_metadata(self) -> dict:
        """Load JSON sidecar for disease model (PRD §8.7)."""
        try:
            from django.conf import settings
            meta_path = os.path.join(
                settings.BASE_DIR, 'ai', 'models', 'disease_detection_efficientnet.json'
            )
            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"[DiseaseEngine] Could not load model metadata: {e}")
        return {}

