"""
apps/workforce/views.py
Workforce listing endpoint for agricultural labour.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workforce_list(request):
    """GET /api/v1/workforce/ — list available agricultural workforce."""
    try:
        from apps.core.supabase_client import supabase
        result = supabase.table('workforce').select('*').limit(20).execute()
        data = result.data or []
    except Exception as e:
        logger.warning(f"workforce_list error: {e}")
        data = []
    return Response({'workforce': data, 'count': len(data)})
