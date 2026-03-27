"""
apps/transport/views.py
Agricultural transport listing endpoints.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transport_list(request):
    """GET /api/v1/transport/ — list transport options."""
    try:
        from apps.core.supabase_client import supabase
        result = supabase.table('transport').select('*').limit(20).execute()
        data = result.data or []
    except Exception as e:
        logger.warning(f"transport_list error: {e}")
        data = []
    return Response({'transport': data, 'count': len(data)})
