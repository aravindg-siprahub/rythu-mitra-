from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .kpi_service import KPIService

# Cache stats for 60 seconds to reduce DB load
CACHE_TTL = 60 

class KPIView(APIView):
    """
    Unified API Endpoint for Command Center KPIs.
    """
    permission_classes = [AllowAny] # TODO: Switch to IsAuthenticated for Prod

    @method_decorator(cache_page(CACHE_TTL))
    def get(self, request, metric_type):
        """
        Fetch specific KPI metrics based on type.
        """
        if metric_type == 'national-summary':
            data = KPIService.get_national_summary()
        elif metric_type == 'regional-map':
            data = KPIService.get_regional_summary()
        elif metric_type == 'ai-health':
            data = KPIService.get_ai_health()
        elif metric_type == 'operations':
            data = KPIService.get_operations_summary()
        elif metric_type == 'governance':
            data = KPIService.get_risk_governance()
        else:
            return Response({"error": "Invalid metric type"}, status=400)
        
        return Response(data)
