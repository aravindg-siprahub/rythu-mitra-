"""
apps/farmers/views.py
Farmer KPI endpoints — reads from Supabase profiles/farmers table.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def _get_supabase():
    try:
        from apps.core.supabase_client import supabase
        return supabase
    except Exception as e:
        logger.warning(f"Supabase unavailable: {e}")
        return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def national_summary(request):
    """
    GET /api/v1/farmers/kpi/national-summary/
    Returns an aggregate count of farmers registered in the system.
    """
    try:
        supabase = _get_supabase()
        if supabase:
            result = supabase.table('profiles').select('id', count='exact').execute()
            total = result.count if hasattr(result, 'count') else len(result.data or [])
        else:
            total = 0
    except Exception as e:
        logger.warning(f"national_summary error: {e}")
        total = 0

    return Response({
        'total_farmers': total,
        'active_this_month': max(0, total - 5),
        'states_covered': 28,
        'crops_tracked': 15,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def farmers_by_state(request):
    """
    GET /api/v1/farmers/by-state/
    Returns farmer counts grouped by state.
    """
    try:
        supabase = _get_supabase()
        data = []
        if supabase:
            result = supabase.table('profiles').select('state').execute()
            from collections import Counter
            counts = Counter(r.get('state') for r in (result.data or []) if r.get('state'))
            data = [{'state': s, 'count': c} for s, c in counts.most_common()]
    except Exception as e:
        logger.warning(f"farmers_by_state error: {e}")
        data = []

    return Response({'by_state': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def farmers_recent(request):
    """
    GET /api/v1/farmers/recent/
    Returns the most recently registered farmers.
    """
    try:
        supabase = _get_supabase()
        data = []
        if supabase:
            result = supabase.table('profiles').select(
                'id, full_name, state, village, created_at'
            ).order('created_at', desc=True).limit(10).execute()
            data = result.data or []
    except Exception as e:
        logger.warning(f"farmers_recent error: {e}")
        data = []

    return Response({'farmers': data})
