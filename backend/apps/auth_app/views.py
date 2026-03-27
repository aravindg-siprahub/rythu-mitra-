"""
Auth views — register, login, logout, token verification.
"""
import logging
import httpx
from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from pydantic import BaseModel, Field, EmailStr, ValidationError
from typing import Literal

from apps.core.supabase_client import supabase
from apps.core.response import success, error
from apps.core.validators import sanitize_text

logger = logging.getLogger(__name__)

SUPABASE_AUTH_URL_TEMPLATE = "{supabase_url}/auth/v1/token?grant_type=password"


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=50)
    phone: str | None = Field(default=None)
    state: str = Field(min_length=2, max_length=50)
    district: str = Field(min_length=2, max_length=50)
    role: str | None = Field(default='farmer')
    preferred_language: Literal['en', 'te', 'hi'] = 'en'


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


# ── Views ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register(request):
    """
    POST /api/v1/auth/register/
    Creates Supabase auth user + profile record.
    """
    try:
        data = RegisterInput(**request.data)
    except ValidationError as e:
        return error("Validation failed.", code="VALIDATION_ERROR",
                     details=e.errors(), status=400)

    full_name = sanitize_text(data.full_name)
    username = sanitize_text(data.username).lower()
    state = sanitize_text(data.state)
    district = sanitize_text(data.district)

    # Check phone uniqueness (only if phone was provided — form doesn't require it)
    if data.phone:
        existing = supabase.table('profiles').select('id').eq('phone', data.phone).execute()
        if existing.data:
            return error("This phone number is already registered.", code="PHONE_TAKEN", status=409)

    # Check username uniqueness 
    existing_user = supabase.table('profiles').select('id').eq('username', username).execute()
    if existing_user.data:
        return error("This username is already taken.", code="USERNAME_TAKEN", status=409)

    # Create Supabase auth user
    try:
        auth_resp = supabase.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": full_name,
                "phone": data.phone,
            }
        })
        user_id = auth_resp.user.id
    except Exception as e:
        msg = str(e).lower()
        if 'already registered' in msg or 'already exists' in msg or 'been registered' in msg:
            return error("This email is already registered.", code="EMAIL_TAKEN", status=409)
        logger.error(f"Supabase create_user failed for {data.email}: {e}")
        return error("Registration failed. Please try again.", status=500)

    # Create profile record
    try:
        profile = {
            "id": str(user_id),
            "full_name": full_name,
            "username": username,
            "phone": data.phone,
            "state": state,
            "district": district,
            "role": data.role or 'farmer',
            "preferred_language": data.preferred_language,
        }
        supabase.table('profiles').insert(profile).execute()
    except Exception as e:
        logger.error(f"Profile creation failed for {user_id}: {e}")
        return success({
            "user_id": str(user_id),
            "email": data.email,
            "profile_error": True
        }, message="Account created but profile setup failed. Please contact support.", status=201)

    return success({
        "user_id": str(user_id),
        "email": data.email,
        "user": {
            "id": str(user_id),
            "email": data.email,
            "full_name": full_name,
            "username": username,
            "profile": {
                "full_name": full_name,
                "username": username,
                "phone": data.phone,
                "state": state,
                "district": district,
                "role": data.role or 'farmer',
            }
        }
    }, message="Account created successfully.", status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login(request):
    """
    POST /api/v1/auth/login/
    Proxies to Supabase Auth to get JWT tokens.
    Frontend can also call Supabase JS SDK directly.
    """
    try:
        data = LoginInput(**request.data)
    except ValidationError as e:
        return error("Validation failed.", code="VALIDATION_ERROR",
                     details=e.errors(), status=400)

    from decouple import config
    supabase_url = config('SUPABASE_URL', default='')
    anon_key = config('SUPABASE_ANON_KEY', default='')

    try:
        resp = httpx.post(
            f"{supabase_url}/auth/v1/token?grant_type=password",
            headers={
                "apikey": anon_key,
                "Content-Type": "application/json",
            },
            json={"email": data.email, "password": data.password},
            timeout=15.0,
        )
        if resp.status_code != 200:
            return error("Invalid email or password.", code="INVALID_CREDENTIALS", status=401)

        token_data = resp.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        user_info = token_data.get('user', {})

        # Fetch profile for return
        profile = None
        try:
            p = supabase.table('profiles').select('*').eq('id', user_info.get('id', '')).single().execute()
            profile = p.data
        except Exception:
            pass

        return success({
            "token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user_info.get('id'),
                "email": user_info.get('email'),
                "full_name": user_info.get('user_metadata', {}).get('full_name') or (profile.get('full_name') if profile else None),
                "profile": profile,
            }
        }, message="Login successful.")

    except httpx.HTTPError as e:
        logger.error(f"Login proxy failed: {e}")
        return error("Login service unavailable. Please try again.", status=503)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def logout(request):
    """
    POST /api/v1/auth/logout/
    Client-side logout (token is stateless JWT). Always returns 200.
    """
    return success({"message": "Logged out successfully."})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def verify_token(request):
    """
    POST /api/v1/auth/verify-token/
    Verifies Bearer token and returns decoded payload.
    Used by frontend on app load to check session validity.
    """
    from apps.core.permissions import SupabaseJWTAuthentication
    from rest_framework.exceptions import AuthenticationFailed

    try:
        auth = SupabaseJWTAuthentication()
        result = auth.authenticate(request)
        if result is None:
            return error("No token provided.", code="NO_TOKEN", status=401)
        payload, _ = result
        return success({
            "valid": True,
            "user_id": payload.get('sub'),
            "email": payload.get('email'),
            "expires_at": payload.get('exp'),
        })
    except AuthenticationFailed as e:
        return error(str(e), code="INVALID_TOKEN", status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def refresh_token(request):
    """
    POST /api/v1/auth/token/refresh/
    Proxies to Supabase Auth to refresh a session.
    Body: { "refresh": "your-refresh-token" }
    """
    refresh = request.data.get('refresh')
    if not refresh:
        return error("Refresh token is required.", code="NO_REFRESH", status=400)

    from decouple import config
    supabase_url = config('SUPABASE_URL', default='')
    anon_key = config('SUPABASE_ANON_KEY', default='')

    try:
        resp = httpx.post(
            f"{supabase_url}/auth/v1/token?grant_type=refresh_token",
            headers={
                "apikey": anon_key,
                "Content-Type": "application/json",
            },
            json={"refresh_token": refresh},
            timeout=15.0,
        )
        if resp.status_code != 200:
            return error("Invalid refresh token.", code="INVALID_GRANT", status=401)

        token_data = resp.json()
        return success({
            "access": token_data.get('access_token'),
            "refresh": token_data.get('refresh_token'),
        }, message="Token refreshed.")

    except httpx.HTTPError as e:
        logger.error(f"Refresh proxy failed: {e}")
        return error("Service unavailable.", status=503)
