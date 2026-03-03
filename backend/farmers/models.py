from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
import uuid

# ============================================
# CORE ENTITIES
# ============================================

class Farmer(models.Model):
    """Enhanced Farmer Profile with Geographic Data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile', null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, unique=True)
    village = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    mandal = models.CharField(max_length=255, null=True, blank=True) # Added for Phase 1 Hierarchy
    state = models.CharField(max_length=255)
    # Note: Using CharField for coordinates temporarily; upgrade to PostGIS later
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'farmers'
        indexes = [
            models.Index(fields=['district', 'state']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} - {self.village}"


class LandHolding(models.Model):
    """Farmer's Land Parcels"""
    SOIL_TYPES = [
        ('CLAY', 'Clay'),
        ('SANDY', 'Sandy'),
        ('LOAMY', 'Loamy'),
        ('SILTY', 'Silty'),
        ('BLACK', 'Black Soil'),
        ('RED', 'Red Soil'),
    ]
    
    IRRIGATION_TYPES = [
        ('RAINFED', 'Rain Fed'),
        ('BOREWELL', 'Borewell'),
        ('CANAL', 'Canal'),
        ('DRIP', 'Drip Irrigation'),
        ('SPRINKLER', 'Sprinkler'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='land_holdings')
    area_acres = models.DecimalField(max_digits=10, decimal_places=2)
    soil_type = models.CharField(max_length=50, choices=SOIL_TYPES)
    irrigation_type = models.CharField(max_length=50, choices=IRRIGATION_TYPES)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'land_holdings'

    def __str__(self):
        return f"{self.farmer.name} - {self.area_acres} acres"


class SoilReport(models.Model):
    """Soil Test Results"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    land = models.ForeignKey(LandHolding, on_delete=models.CASCADE, related_name='soil_reports')
    nitrogen = models.DecimalField(max_digits=5, decimal_places=2, help_text="kg/ha")
    phosphorus = models.DecimalField(max_digits=5, decimal_places=2, help_text="kg/ha")
    potassium = models.DecimalField(max_digits=5, decimal_places=2, help_text="kg/ha")
    ph_level = models.DecimalField(max_digits=3, decimal_places=1)
    organic_carbon = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    tested_at = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'soil_reports'
        ordering = ['-tested_at']

    def __str__(self):
        return f"Soil Report - {self.land.farmer.name} - {self.tested_at}"


# ============================================
# AI INFERENCE TRACKING
# ============================================

class AICropRecommendation(models.Model):
    """AI-Generated Crop Recommendations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='crop_recommendations')
    land = models.ForeignKey(LandHolding, on_delete=models.CASCADE, null=True, blank=True)
    model_version = models.CharField(max_length=20)
    input_data = models.JSONField()
    recommended_crops = models.JSONField()
    confidence_scores = models.JSONField()
    predicted_yield = models.JSONField(null=True, blank=True)
    revenue_projection = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    inference_time_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_crop_recommendations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farmer', '-created_at']),
        ]

    def __str__(self):
        return f"Recommendation - {self.farmer.name} - {self.created_at.date()}"


class DiseaseDetection(models.Model):
    """Computer Vision Disease Detection Results"""
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MODERATE', 'Moderate'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='disease_detections')
    image_url = models.URLField()
    detected_disease = models.CharField(max_length=255)
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    treatment_recommendation = models.TextField()
    model_version = models.CharField(max_length=20)
    false_positive_flag = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'disease_detections'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.detected_disease} - {self.farmer.name}"


class MarketPriceForecast(models.Model):
    """Market Price Predictions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop_name = models.CharField(max_length=100)
    mandi_location = models.CharField(max_length=255)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    forecast_7d = models.DecimalField(max_digits=10, decimal_places=2)
    forecast_14d = models.DecimalField(max_digits=10, decimal_places=2)
    forecast_30d = models.DecimalField(max_digits=10, decimal_places=2)
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    volatility_index = models.DecimalField(max_digits=5, decimal_places=2)
    model_version = models.CharField(max_length=20)
    forecasted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'market_price_forecasts'
        ordering = ['-forecasted_at']
        indexes = [
            models.Index(fields=['crop_name', 'mandi_location']),
        ]

    def __str__(self):
        return f"{self.crop_name} - {self.mandi_location}"


class WeatherIntelligence(models.Model):
    """Weather Data and Risk Indices"""
    ALERT_LEVELS = [
        ('INFO', 'Info'),
        ('MODERATE', 'Moderate'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    region = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    rainfall_mm = models.DecimalField(max_digits=6, decimal_places=2)
    rainfall_anomaly_percent = models.DecimalField(max_digits=5, decimal_places=2)
    temperature_c = models.DecimalField(max_digits=4, decimal_places=1)
    humidity_percent = models.DecimalField(max_digits=4, decimal_places=1)
    drought_risk_index = models.DecimalField(max_digits=3, decimal_places=2)
    flood_risk_index = models.DecimalField(max_digits=3, decimal_places=2)
    satellite_data_timestamp = models.DateTimeField()
    alert_level = models.CharField(max_length=20, choices=ALERT_LEVELS)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weather_intelligence'
        ordering = ['-recorded_at']

    def __str__(self):
        return f"Weather - {self.region} - {self.recorded_at.date()}"


# ============================================
# OPERATIONS TRACKING
# ============================================

class TransportBooking(models.Model):
    """Transport Service Bookings"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('IN_TRANSIT', 'In Transit'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    RISK_LEVELS = [
        ('LOW', 'Low'),
        ('MODERATE', 'Moderate'),
        ('HIGH', 'High'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='transport_bookings')
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6)
    drop_lat = models.DecimalField(max_digits=9, decimal_places=6)
    drop_lng = models.DecimalField(max_digits=9, decimal_places=6)
    cargo_type = models.CharField(max_length=100)
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2)
    requested_date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    vehicle_assigned = models.CharField(max_length=100, blank=True)
    route_optimization_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    delay_risk = models.CharField(max_length=20, choices=RISK_LEVELS, default='LOW')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transport_bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Transport - {self.farmer.name} - {self.status}"


class WorkerBooking(models.Model):
    """Agricultural Worker Bookings"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIALLY_FILLED', 'Partially Filled'),
        ('FULFILLED', 'Fulfilled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='worker_bookings')
    task_type = models.CharField(max_length=100)
    workers_required = models.IntegerField()
    workers_assigned = models.IntegerField(default=0)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    scheduled_date = models.DateField()
    wage_per_day = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'worker_bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Worker Booking - {self.farmer.name} - {self.task_type}"


# ============================================
# RISK & ALERT SYSTEM
# ============================================

class RiskAlert(models.Model):
    """Unified Risk Alert System"""
    ALERT_TYPES = [
        ('DISEASE_OUTBREAK', 'Disease Outbreak'),
        ('WEATHER_EMERGENCY', 'Weather Emergency'),
        ('MARKET_CRASH', 'Market Crash'),
        ('TRANSPORT_DISRUPTION', 'Transport Disruption'),
        ('LABOR_SHORTAGE', 'Labor Shortage'),
        ('MODEL_DRIFT', 'Model Drift'),
        ('SYSTEM_FAILURE', 'System Failure'),
    ]

    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MODERATE', 'Moderate'),
        ('INFO', 'Info'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    region = models.CharField(max_length=255)
    affected_farmers_count = models.IntegerField(default=0)
    estimated_impact_inr = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    recommended_action = models.TextField()
    source_system = models.CharField(max_length=50)
    acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'risk_alerts'
        ordering = ['-severity', '-created_at']
        indexes = [
            models.Index(fields=['severity', '-created_at']),
            models.Index(fields=['alert_type']),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.alert_type} - {self.region}"


# ============================================
# AI DECISION ENGINE
# ============================================

class AIDecision(models.Model):
    """AI-Generated Decisions Pending Human Approval"""
    SERVICE_TYPES = [
        ('CROP_RECOMMENDATION', 'Crop Recommendation'),
        ('DISEASE_TREATMENT', 'Disease Treatment'),
        ('MARKET_TIMING', 'Market Timing'),
        ('WEATHER_ACTION', 'Weather Action'),
        ('TRANSPORT_OPTIMIZATION', 'Transport Optimization'),
        ('WORKER_ALLOCATION', 'Worker Allocation'),
    ]

    EXECUTION_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('EXECUTED', 'Executed'),
        ('VERIFIED', 'Verified'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='ai_decisions')
    ai_recommendation = models.TextField()
    estimated_yield_impact_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    estimated_revenue_impact_inr = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    required_resources = models.JSONField(null=True, blank=True)
    execution_status = models.CharField(max_length=50, choices=EXECUTION_STATUS, default='PENDING')
    human_approval = models.BooleanField(null=True, blank=True)
    approved_by = models.CharField(max_length=255, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_decisions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['execution_status']),
        ]

    def __str__(self):
        return f"{self.service_type} - {self.farmer.name} - {self.execution_status}"


# ============================================
# GOVERNANCE & AUDIT
# ============================================

class AuditLog(models.Model):
    """System Audit Trail"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.UUIDField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_payload = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', '-created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.action} - {self.created_at}"


class APIHealthMetric(models.Model):
    """API Performance Monitoring"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_name = models.CharField(max_length=100)
    endpoint = models.CharField(max_length=255)
    response_time_ms = models.IntegerField()
    status_code = models.IntegerField()
    error_message = models.TextField(blank=True)
    throughput_rps = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_health_metrics'
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.service_name} - {self.endpoint}"
