"""
apps/auth_app/profile_views.py
Profile get and update endpoints.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.core.supabase_client import supabase

logger = logging.getLogger(__name__)


def _get_user_id(request):
    u = request.user
    if hasattr(u, 'get'):
        return u.get('sub') or u.get('id')
    return getattr(u, 'id', None)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """GET /api/v1/auth/profile/ — fetch current user profile."""
    uid = _get_user_id(request)
    if not uid:
        return Response({'error': 'User not authenticated'}, status=401)
    try:
        result = supabase.table('profiles').select('*').eq('id', str(uid)).single().execute()
        return Response({'profile': result.data or {}})
    except Exception as e:
        logger.error(f"get_profile error: {e}")
        return Response({'error': 'Profile not found'}, status=404)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """PUT/PATCH /api/v1/auth/profile/update/ — update current user profile."""
    uid = _get_user_id(request)
    if not uid:
        return Response({'error': 'User not authenticated'}, status=401)

    allowed_fields = {'full_name', 'village', 'state', 'district', 'phone', 'preferred_language', 'role'}
    update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

    if not update_data:
        return Response({'error': 'No valid fields to update'}, status=400)

    try:
        result = supabase.table('profiles').update(update_data).eq('id', str(uid)).execute()
        return Response({'profile': result.data[0] if result.data else update_data, 'message': 'Profile updated successfully.'})
    except Exception as e:
        logger.error(f"update_profile error: {e}")
        return Response({'error': f'Update failed: {str(e)}'}, status=500)
