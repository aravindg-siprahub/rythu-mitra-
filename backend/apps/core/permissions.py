"""
apps/core/permissions.py
Supabase JWT Authentication backend for Django REST Framework.

Supabase may issue access tokens as HS256 (legacy) or ES256 (JWKS).
HS256 is verified with SUPABASE_JWT_SECRET; ES256 with Supabase JWKS.
"""
import jwt
import logging
from django.conf import settings
from jwt import PyJWKClient
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

# Cached JWKS client (ES256) — one per process
_jwks_client = None


def _get_jwks_client():
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client
    supabase_url = getattr(settings, 'SUPABASE_URL', '') or ''
    supabase_url = supabase_url.rstrip('/')
    if not supabase_url:
        return None
    jwks_url = f'{supabase_url}/auth/v1/.well-known/jwks.json'
    try:
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    except Exception as e:
        logger.warning('PyJWKClient init failed: %s', e)
        return None
    return _jwks_client


def _decode_supabase_jwt_es256(token: str) -> dict:
    """Verify ES256 Supabase access token using project JWKS."""
    client = _get_jwks_client()
    if client is None:
        raise AuthenticationFailed('SUPABASE_URL not configured for ES256 JWT verification.')
    signing_key = client.get_signing_key_from_jwt(token)
    try:
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=['ES256'],
            audience='authenticated',
            options={'verify_exp': True},
        )
    except jwt.InvalidAudienceError:
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=['ES256'],
            options={'verify_exp': True, 'verify_aud': False},
        )


def _decode_supabase_jwt_hs256(token: str, jwt_secret: str) -> dict:
    """Verify HS256 token with symmetric secret (legacy / some configs)."""
    try:
        return jwt.decode(
            token,
            jwt_secret,
            algorithms=['HS256'],
            options={'verify_exp': True},
            audience='authenticated',
        )
    except jwt.InvalidAudienceError:
        return jwt.decode(
            token,
            jwt_secret,
            algorithms=['HS256'],
            options={'verify_exp': True, 'verify_aud': False},
        )

class SupabaseUser(dict):
    """Dict-like user object populated from the JWT payload."""
    is_authenticated = True
    is_anonymous = False

    def __init__(self, payload: dict):
        super().__init__(payload)
        self._payload = payload

    @property
    def id(self):
        return self._payload.get('sub')

    def get(self, key, default=None):
        return self._payload.get(key, default)


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Validates the Supabase JWT from the Authorization: Bearer <token> header.
    Sets request.user to a SupabaseUser dict-like object.
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header[7:]
        if not token:
            return None

        try:
            header = jwt.get_unverified_header(token)
        except jwt.PyJWTError as e:
            raise AuthenticationFailed('Invalid token format.')

        alg = (header.get('alg') or '').upper()

        try:
            if alg == 'ES256':
                payload = _decode_supabase_jwt_es256(token)
            elif alg == 'HS256':
                jwt_secret = getattr(settings, 'SUPABASE_JWT_SECRET', '')
                if not jwt_secret:
                    raise AuthenticationFailed('SUPABASE_JWT_SECRET not configured.')
                payload = _decode_supabase_jwt_hs256(token, jwt_secret)
            else:
                raise AuthenticationFailed(f'Unsupported JWT algorithm: {alg or "unknown"}')
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except AuthenticationFailed:
            raise
        except jwt.PyJWTError as e:
            raise AuthenticationFailed(f'Invalid token: {e}')

        user = SupabaseUser(payload)
        return (user, token)

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
