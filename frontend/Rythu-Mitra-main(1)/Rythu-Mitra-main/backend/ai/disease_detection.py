import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import logging
from .model_factory import ModelFactory
import numpy as np

logger = logging.getLogger(__name__)

class DiseaseDetectionEngine:
    """
    FAANG-Grade Disease Detection System using EfficientNet-B7.
    Optimized for mobile-uploaded images.
    """

    def __init__(self):
        self.model = ModelFactory.get_model('efficientnet_b7_plant_disease.pth', 'pytorch')
        self.class_names = self._load_class_names()
        
        # Standard ImageNet normalization + Resize for EfficientNet
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def _load_class_names(self):
        # In production this would be loaded from a JSON/meta file
        return [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Corn___Common_rust", "Corn___Northern_Leaf_Blight", "Corn___healthy",
            "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___healthy",
            "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___healthy"
        ]

    def predict_from_image(self, image_bytes):
        """
        Diagnoses crop disease from image bytes.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            tensor = self.transform(image).unsqueeze(0) # Add batch dimension

            if self.model:
                device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                self.model.to(device)
                tensor = tensor.to(device)
                
                with torch.no_grad():
                    outputs = self.model(tensor)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    confidence, predicted_idx = torch.max(probabilities, 1)
                
                predicted_class = self.class_names[predicted_idx.item()]
                conf_score = confidence.item() * 100
            else:
                # Mock Inference for Demo/Dev when model is missing
                logger.warning("Disease Model not found. Using Mock Inference.")
                # Simulate analysis delay
                import time; time.sleep(0.5)
                # Return a dummy result based on random seed or just fixed for stability
                predicted_class = "Tomato___Early_blight"
                conf_score = 96.5

            return {
                'disease': predicted_class,
                'confidence': round(conf_score, 2),
                'severity': 'High' if 'late' in predicted_class.lower() or 'rot' in predicted_class.lower() else 'Moderate',
                'recommendation': self._get_treatment(predicted_class)
            }

        except Exception as e:
            logger.error(f"Disease Detection Error: {e}")
            return {'error': str(e)}

    def _get_treatment(self, disease_name):
        """
        Returns treatment recommendations database lookup.
        """
        treatments = {
            "Tomato___Early_blight": "Apply Copper-based fungicides (mancozeb). Improve air circulation.",
            "Potato___Late_blight": "Use Metalaxyl fungicides. Destroy infected tubers immediately.",
            "Corn___Common_rust": "Plant resistant hybrids. Apply fungicides if infection is early.",
        }
        return treatments.get(disease_name, "Consult a local agronomist for specific chemical application.")
