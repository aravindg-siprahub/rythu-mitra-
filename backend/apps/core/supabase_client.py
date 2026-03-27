"""
apps/core/supabase_client.py
Singleton Supabase client — shared across all apps.
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

_supabase_client = None


def _create_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    try:
        from supabase import create_client, Client
        url = getattr(settings, 'SUPABASE_URL', '')
        key = getattr(settings, 'SUPABASE_SERVICE_KEY', '') or getattr(settings, 'SUPABASE_ANON_KEY', '')
        if not url or not key:
            logger.warning("SUPABASE_URL or SUPABASE_SERVICE_KEY not set.")
            return None
        _supabase_client = create_client(url, key)
        logger.info("Supabase client created successfully.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        return None


class _LazySupabaseClient:
    """Lazy proxy to supabase client — only connects on first use."""
    def __getattr__(self, name):
        client = _create_client()
        if client is None:
            raise RuntimeError("Supabase client is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")
        return getattr(client, name)


supabase = _LazySupabaseClient()
