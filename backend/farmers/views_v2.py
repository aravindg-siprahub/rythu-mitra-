from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .kpi_service import KPIService

# Cache hierarchical data for 5 minutes (300s)
HIERARCHY_CACHE_TTL = 300

class HierarchyView(APIView):
    """
    API for National -> State -> District -> Mandal Drill Down
    """
    permission_classes = [AllowAny] 

    @method_decorator(cache_page(HIERARCHY_CACHE_TTL))
    def get(self, request, level, parent_id=None):
        """
        Fetch stats for a specific hierarchy level.
        Parent ID is optional for top-level (national).
        """
        # Validate Level
        if level not in ['national', 'state', 'district', 'mandal']:
             return Response({"error": "Invalid hierarchy level"}, status=400)
             
        data = KPIService.get_hierarchy_stats(level, parent_id)
        return Response(data)
