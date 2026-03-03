from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Sum
from .models import (
    Farmer, LandHolding, SoilReport,
    AICropRecommendation, DiseaseDetection, MarketPriceForecast, WeatherIntelligence,
    TransportBooking, WorkerBooking, RiskAlert, AIDecision, AuditLog, APIHealthMetric
)
from .serializers import (
    FarmerSerializer, LandHoldingSerializer, SoilReportSerializer,
    AICropRecommendationSerializer, DiseaseDetectionSerializer, MarketPriceForecastSerializer, WeatherIntelligenceSerializer,
    TransportBookingSerializer, WorkerBookingSerializer, RiskAlertSerializer, AIDecisionSerializer,
    AuditLogSerializer, APIHealthMetricSerializer
)
import random  # Mocking until real AI connection is live

class DashboardViewSet(viewsets.ViewSet):
    """
    Central Command Center Data Aggregation
    """
    @action(detail=False, methods=['get'])
    def kpi_stats(self, request):
        """Row 1: National KPI Statistics"""
        return Response({
            "active_farmers": Farmer.objects.count(),
            "ai_crop_success_rate": 87.5,  # Mocked logic
            "disease_detection_accuracy": 92.3,
            "market_confidence": 78.4,
            "weather_severity": "MODERATE",
            "active_transport": TransportBooking.objects.filter(status='IN_TRANSIT').count(),
            "active_workers": WorkerBooking.objects.filter(status='FULFILLED').aggregate(total=Sum('workers_assigned'))['total'] or 0
        })

    @action(detail=False, methods=['get'])
    def ai_monitoring(self, request):
        """Row 2: AI Service Health"""
        return Response({
            "crop_engine": {
                "inferences": AICropRecommendation.objects.count(),
                "model_version": "v2.1.0",
                "confidence": 0.88,
                "drift_score": 0.04
            },
            "disease_cv": {
                "images_processed": DiseaseDetection.objects.count(),
                "accuracy": 0.94,
                "risk_zones": ["Punjab", "Telangana"]
            },
            "market_engine": {
                "status": "ONLINE",
                "forecast_accuracy": 0.82
            },
            "weather_engine": {
                "rainfall_anomaly": 12.5,
                "drought_risk": "LOW"
            }
        })

class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer

class LandHoldingViewSet(viewsets.ModelViewSet):
    queryset = LandHolding.objects.all()
    serializer_class = LandHoldingSerializer

class SoilReportViewSet(viewsets.ModelViewSet):
    """SoilReport ViewSet — was missing (pre-existing bug), added to fix ImportError."""
    queryset = SoilReport.objects.all()
    serializer_class = SoilReportSerializer

class AICropRecommendationViewSet(viewsets.ModelViewSet):
    queryset = AICropRecommendation.objects.all()
    serializer_class = AICropRecommendationSerializer

class DiseaseDetectionViewSet(viewsets.ModelViewSet):
    queryset = DiseaseDetection.objects.all()
    serializer_class = DiseaseDetectionSerializer

class MarketPriceForecastViewSet(viewsets.ModelViewSet):
    queryset = MarketPriceForecast.objects.all()
    serializer_class = MarketPriceForecastSerializer

class WeatherIntelligenceViewSet(viewsets.ModelViewSet):
    queryset = WeatherIntelligence.objects.all()
    serializer_class = WeatherIntelligenceSerializer

class TransportBookingViewSet(viewsets.ModelViewSet):
    queryset = TransportBooking.objects.all()
    serializer_class = TransportBookingSerializer

class WorkerBookingViewSet(viewsets.ModelViewSet):
    queryset = WorkerBooking.objects.all()
    serializer_class = WorkerBookingSerializer

class RiskAlertViewSet(viewsets.ModelViewSet):
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer

class AIDecisionViewSet(viewsets.ModelViewSet):
    queryset = AIDecision.objects.all()
    serializer_class = AIDecisionSerializer

class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
