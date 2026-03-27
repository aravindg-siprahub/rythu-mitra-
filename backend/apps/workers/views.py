"""
apps/workers/views.py
Agricultural worker listing endpoints.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_list(request):
    """GET /api/v1/workers/ — list agricultural workers."""
    try:
        from apps.core.supabase_client import supabase
        result = supabase.table('workers').select('*').limit(20).execute()
        data = result.data or []
    except Exception as e:
        logger.warning(f"worker_list error: {e}")
        data = []
    return Response({'workers': data, 'count': len(data)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_detail(request, pk):
    """GET /api/v1/workers/<id>/ — single worker."""
    try:
        from apps.core.supabase_client import supabase
        result = supabase.table('workers').select('*').eq('id', pk).single().execute()
        return Response(result.data or {})
    except Exception as e:
        logger.warning(f"worker_detail error: {e}")
        return Response({'error': 'Not found'}, status=404)
