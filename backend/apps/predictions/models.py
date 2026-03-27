"""
apps/predictions/models.py
Prediction model — stores AI prediction results per farmer.
Uses SQLite (configured as default DB in settings).
"""
from django.db import models


class Prediction(models.Model):
    PREDICTION_TYPES = [
        ('crop', 'Crop Recommendation'),
        ('disease', 'Disease Detection'),
        ('market', 'Market Prediction'),
        ('weather', 'Weather Advisory'),
    ]

    farmer_uuid = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES, db_index=True)
    input_data = models.JSONField(default=dict)
    result = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farmer_uuid', 'prediction_type']),
        ]

    def __str__(self):
        return f"{self.prediction_type} for {self.farmer_uuid} at {self.created_at}"
