"""
ml_factory/disease/inference.py — Disease Detection Inference
==============================================================
Loaded at startup. API calls this — never train.py.
Confidence < 0.60 → return Uncertain response.
"""

import io
import os
import json
import time
import hashlib
import logging
import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image

logger = logging.getLogger(__name__)

MAX_IMAGE_SIZE_MB = 5
CONFIDENCE_THRESHOLD = 0.60

eval_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def risk_level_from_confidence(conf: float) -> str:
    if conf >= 0.80:
        return "Low"
    elif conf >= 0.60:
        return "Medium"
    return "High"


def load_disease_model(models_dir: str) -> dict:
    """Load disease model and metadata. Returns dict or None entries."""
    result = {"model": None, "class_names": [], "severity_map": {}}

    # Class names
    cn_path = os.path.join(models_dir, "disease_class_names.json")
    if os.path.exists(cn_path):
        with open(cn_path) as f:
            result["class_names"] = json.load(f)
    else:
        logger.warning(f"[DiseaseInference] class_names not found at {cn_path}")
        return result

    # Severity map
    sev_path = os.path.join(models_dir, "disease_severity_map.json")
    if os.path.exists(sev_path):
        with open(sev_path) as f:
            result["severity_map"] = json.load(f)

    # Model weights
    model_path = os.path.join(models_dir, "disease_resnet18_v1.pt")
    if os.path.exists(model_path):
        num_classes = len(result["class_names"])
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, num_classes)
        model.load_state_dict(torch.load(model_path, map_location="cpu", weights_only=True))
        model.eval()
        result["model"] = model
        logger.info(f"[DiseaseInference] Model loaded: {num_classes} classes")
    else:
        logger.warning(f"[DiseaseInference] Model not found at {model_path}")

    return result


def predict_from_bytes(image_bytes: bytes, disease_assets: dict) -> dict:
    """
    Run disease inference on image bytes.

    Args:
        image_bytes: raw image data
        disease_assets: loaded dict from load_disease_model()

    Returns:
        PRD-spec response with disease, confidence, severity, risk_level
    """
    t_start = time.monotonic()

    model = disease_assets.get("model")
    class_names = disease_assets.get("class_names", [])
    severity_map = disease_assets.get("severity_map", {})

    if not model or not class_names:
        return {
            "status": "error",
            "message": "Disease model not loaded. Run: python manage.py train_kaggle_models --model disease",
            "http_status": 503,
        }

    # Validate image size
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        return {
            "status": "validation_error",
            "message": f"Image too large: {size_mb:.1f}MB (max {MAX_IMAGE_SIZE_MB}MB)",
            "http_status": 422,
        }

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return {
            "status": "validation_error",
            "message": f"Invalid image: {e}",
            "http_status": 422,
        }

    tensor = eval_transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        max_prob, predicted_idx = torch.max(probabilities, 1)

    confidence = float(max_prob.item())
    predicted_class = class_names[predicted_idx.item()]
    is_healthy = "healthy" in predicted_class.lower()

    # Confidence threshold
    if confidence < CONFIDENCE_THRESHOLD:
        inference_ms = int((time.monotonic() - t_start) * 1000)
        return {
            "status": "success",
            "disease": "Uncertain",
            "confidence": round(confidence, 4),
            "severity": "Unknown",
            "risk_level": "Uncertain",
            "is_healthy": False,
            "advisory": "Image unclear. Please retake in good lighting with the affected area clearly visible.",
            "inference_ms": inference_ms,
            "http_status": 200,
        }

    severity = severity_map.get(predicted_class, "Moderate")
    # Downgrade severity if confidence is marginal
    if confidence < 0.70 and severity in ("Critical", "High"):
        downgrade = {"Critical": "High", "High": "Moderate"}
        severity = downgrade.get(severity, severity)

    inference_ms = int((time.monotonic() - t_start) * 1000)

    input_hash = hashlib.sha256(image_bytes[:1024]).hexdigest()[:16]

    return {
        "status": "success",
        "disease": predicted_class,
        "confidence": round(confidence, 4),
        "confidence_pct": round(confidence * 100, 1),
        "severity": severity,
        "risk_level": risk_level_from_confidence(confidence),
        "is_healthy": is_healthy,
        "advisory": None,  # filled by OpenRouter in views.py
        "model_version": "ResNet18_v1.0",
        "inference_ms": inference_ms,
        "input_hash": input_hash,
        "http_status": 200,
    }
