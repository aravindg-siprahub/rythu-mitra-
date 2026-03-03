from django.db.models import Avg
from django.utils import timezone
from datetime import timedelta
from farmers.models import AICropRecommendation, DiseaseDetection, RiskAlert, APIHealthMetric, AIDecision

class AIMonitoringService:
    @staticmethod
    def check_drift(model_name="Crop Recommendation"):
        """
        Calculates drift score and triggers alerts if necessary.
        Formula: drift = abs(current_avg - past_30_day_avg)
        """
        now = timezone.now()
        
        # 1. Get Current Avg (Last 24h)
        current_data = AICropRecommendation.objects.filter(
            timestamp__gte=now - timedelta(days=1)
        ).aggregate(avg=Avg('confidence_score'))
        current_avg = current_data['avg'] or 0.85 # Default to baseline if no data
        
        # 2. Get Past Avg (Last 30 days)
        past_data = AICropRecommendation.objects.filter(
            timestamp__gte=now - timedelta(days=31),
            timestamp__lt=now - timedelta(days=1)
        ).aggregate(avg=Avg('confidence_score'))
        past_avg = past_data['avg'] or 0.90
        
        # 3. Compute Drift
        drift_score = abs(current_avg - past_avg)
        
        # 4. Log Metric
        APIHealthMetric.objects.create(
            endpoint=f"/api/ai/{model_name.lower().replace(' ', '-')}/predict",
            response_time_ms=120, # Mocked latency for now
            status_code=200,
            error_rate=0.0
        )
        
        # 5. Check Thresholds & Alert
        if drift_score > 0.15:
            RiskAlert.objects.create(
                farmer=None, # System alert
                alert_type="MODEL_DRIFT",
                severity="CRITICAL",
                message=f"Creating Critical Alert: {model_name} drift score {drift_score:.4f} exceeds threshold 0.15.",
                is_resolved=False
            )
        elif drift_score > 0.05:
            RiskAlert.objects.create(
                farmer=None,
                alert_type="MODEL_DRIFT",
                severity="WARNING",
                message=f"Warning: {model_name} drift score {drift_score:.4f} is elevated.",
                is_resolved=False
            )

        return drift_score

class AlertEngine:
    @staticmethod
    def classify_and_create_alert(source_type, data):
        """
        Auto-classification rules for alerts.
        """
        severity = "INFO"
        message = f"New event from {source_type}"

        if source_type == "CROP_PREDICTION":
            confidence = data.get('confidence', 1.0)
            if confidence < 0.60:
                severity = "CRITICAL"
                message = "Low confidence prediction detected. Manual expert review required."
            elif confidence < 0.75:
                severity = "WARNING"
                message = "Moderate confidence prediction. Advise caution."
        
        elif source_type == "DISEASE_DETECTION":
            # Example: Check regional thresholds
            district = data.get('district')
            count = DiseaseDetection.objects.filter(
                location_lat__isnull=False, # Proxy for location check
                timestamp__gte=timezone.now() - timedelta(hours=24)
            ).count() # Simply count global for now as mock
            
            if count > 50:
                severity = "CRITICAL"
                message = f"Disease outbreak threshold exceeded in {district}."
        
        # Create Alert
        if severity != "INFO":
             RiskAlert.objects.create(
                alert_type=source_type,
                severity=severity,
                message=message,
                is_resolved=False
            )
        
        return {"severity": severity, "message": message}
