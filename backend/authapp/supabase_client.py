from supabase import create_client
import os


def get_supabase_client():
    """Anon key client — used for auth operations."""
    return create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )


def get_supabase_admin():
    """Service role client — bypasses RLS, for server-side DB ops."""
    return create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
