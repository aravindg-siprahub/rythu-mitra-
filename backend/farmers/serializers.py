from rest_framework import serializers
from .models import (
    Farmer, LandHolding, SoilReport,
    AICropRecommendation, DiseaseDetection, MarketPriceForecast, WeatherIntelligence,
    TransportBooking, WorkerBooking, RiskAlert, AIDecision, AuditLog, APIHealthMetric
)

# ============================================
# CORE ENTITIES SERIALIZERS
# ============================================

class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = '__all__'

class LandHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandHolding
        fields = '__all__'

class SoilReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilReport
        fields = '__all__'

# ============================================
# AI TRACKING SERIALIZERS
# ============================================

class AICropRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AICropRecommendation
        fields = '__all__'

class DiseaseDetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseDetection
        fields = '__all__'

class MarketPriceForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPriceForecast
        fields = '__all__'

class WeatherIntelligenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherIntelligence
        fields = '__all__'

# ============================================
# OPERATIONS SERIALIZERS
# ============================================

class TransportBookingSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)

    class Meta:
        model = TransportBooking
        fields = '__all__'

class WorkerBookingSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)

    class Meta:
        model = WorkerBooking
        fields = '__all__'

# ============================================
# RISK & GOVERNANCE SERIALIZERS
# ============================================

class RiskAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskAlert
        fields = '__all__'

class AIDecisionSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)

    class Meta:
        model = AIDecision
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'

class APIHealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIHealthMetric
        fields = '__all__'
