from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerViewSet, LandHoldingViewSet, SoilReportViewSet,
    AICropRecommendationViewSet, DiseaseDetectionViewSet, MarketPriceForecastViewSet,
    WeatherIntelligenceViewSet, TransportBookingViewSet, WorkerBookingViewSet, 
    RiskAlertViewSet, AIDecisionViewSet, AuditLogViewSet, DashboardViewSet
)
from .views_kpi import KPIView
from .views_geo import GeoJSONView
from .views_v2 import HierarchyView

router = DefaultRouter()
# ... (existing code)

urlpatterns = [
    path('', include(router.urls)),
    path('kpi/<str:metric_type>/', KPIView.as_view(), name='kpi-metrics'),
    path('geo/national-map/', GeoJSONView.as_view(), name='geo-national-map'),
    
    # Phase 1: Hierarchical Drill-Down
    path('v2/stats/<str:level>/', HierarchyView.as_view(), name='hierarchy-root'),
    path('v2/stats/<str:level>/<str:parent_id>/', HierarchyView.as_view(), name='hierarchy-child'),
]
