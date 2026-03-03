import uuid
from django.db import models


class PredictionLog(models.Model):
    """Telemetry log for every ML inference call (PRD §Telemetry)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer_id = models.UUIDField(null=True, blank=True, db_index=True)
    domain = models.CharField(max_length=20, db_index=True,
                              choices=[("crop", "Crop"), ("disease", "Disease"),
                                       ("market", "Market"), ("weather", "Weather")])
    model_version = models.CharField(max_length=50)
    input_hash = models.CharField(max_length=16)
    inference_ms = models.IntegerField()
    confidence_score = models.FloatField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["domain", "created_at"]),
        ]

    def __str__(self):
        return f"{self.domain}|{self.model_version}|{self.inference_ms}ms"


class CropPrediction(models.Model):
    """Stored crop recommendation results."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer_id = models.UUIDField(null=True, blank=True)
    n = models.FloatField()
    p = models.FloatField()
    k = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    ph = models.FloatField()
    rainfall = models.FloatField()
    recommended_crop = models.CharField(max_length=100)
    confidence = models.FloatField()
    risk_level = models.CharField(max_length=20)
    model_version = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class DiseasePrediction(models.Model):
    """Stored disease detection results."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer_id = models.UUIDField(null=True, blank=True)
    image_path = models.CharField(max_length=500)
    disease = models.CharField(max_length=200)
    confidence = models.FloatField()
    severity = models.CharField(max_length=20)
    risk_level = models.CharField(max_length=20)
    model_version = models.CharField(max_length=50)
    job_id = models.CharField(max_length=50, unique=True, db_index=True)
    status = models.CharField(max_length=20, default="pending",
                              choices=[("pending", "Pending"), ("completed", "Completed"),
                                       ("failed", "Failed")])
    result_json = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
