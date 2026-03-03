from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .supabase_client import (
    get_supabase_client,
    get_supabase_admin
)
from .models import FarmerProfile
import logging
import re

logger = logging.getLogger(__name__)


def validate_username(username):
    """3-20 chars: letters, numbers, underscore only."""
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return bool(re.match(pattern, username))


def validate_password(password):
    """Minimum 8 characters."""
    return len(password) >= 8


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username', '').strip()
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm = data.get('confirm_password', '')
        state = data.get('state', '').strip()
        district = data.get('district', '').strip()
        farm_size = data.get('farm_size')
        primary_crop = data.get('primary_crop', '')

        # --- Validate ---
        errors = {}
        if not username:
            errors['username'] = 'Required'
        elif not validate_username(username):
            errors['username'] = (
                '3-20 chars, letters/numbers/underscore only'
            )
        if not full_name:
            errors['full_name'] = 'Required'
        if not email:
            errors['email'] = 'Required'
        if not password:
            errors['password'] = 'Required'
        elif not validate_password(password):
            errors['password'] = 'Minimum 8 characters'
        if password != confirm:
            errors['confirm_password'] = 'Passwords do not match'
        if not state:
            errors['state'] = 'Required'
        if not district:
            errors['district'] = 'Required'

        if errors:
            return Response(
                {'errors': errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Check username availability ---
        if FarmerProfile.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            supabase = get_supabase_client()

            # Register in Supabase Auth with email+password
            auth_res = supabase.auth.sign_up({
                'email': email,
                'password': password,
                'options': {
                    'data': {
                        'username': username,
                        'full_name': full_name
                    }
                }
            })

            if not auth_res.user:
                return Response(
                    {'error': 'Registration failed. Try again.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_id = auth_res.user.id

            # Save profile to Supabase profiles table
            admin = get_supabase_admin()
            try:
                profile_data = {
                    'id': user_id,
                    'username': username,
                    'full_name': full_name,
                    'email': email,
                    'state': state,
                    'district': district,
                    'farm_size': float(farm_size) if farm_size else None,
                    'primary_crop': primary_crop or None,
                    'profile_complete': True
                }
                admin.table('profiles').insert(profile_data).execute()

                # Save to Django DB (for local queries)
                FarmerProfile.objects.create(
                    supabase_uid=user_id,
                    username=username,
                    full_name=full_name,
                    email=email,
                    state=state,
                    district=district,
                    farm_size=float(farm_size) if farm_size else None,
                    primary_crop=primary_crop or None,
                    profile_complete=True
                )
            except Exception as sync_e:
                logger.error(f"Post-registration profile sync error: {sync_e}")
                # Don't fail the registration; LoginView will auto-repair next time

            token = (
                auth_res.session.access_token
                if auth_res.session else None
            )
            refresh = (
                auth_res.session.refresh_token
                if getattr(auth_res, 'session', None) else None
            )

            return Response({
                'message': 'Registration successful',
                'token': token,
                'refresh_token': refresh,
                'user': {
                    'id': user_id,
                    'username': username,
                    'full_name': full_name,
                    'email': email,
                    'state': state,
                    'district': district,
                    'primary_crop': primary_crop,
                    'profile_complete': True
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Register error: {e}")
            err_str = str(e).lower()
            if 'already registered' in err_str or 'already exists' in err_str:
                return Response(
                    {'error': 'Email already registered. Please login.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Look up email from username
            email = None
            farmer = None
            try:
                farmer = FarmerProfile.objects.get(username=username)
                email = farmer.email
            except FarmerProfile.DoesNotExist:
                # Fallback: Check Supabase profiles table
                try:
                    admin = get_supabase_admin()
                    prof_res = admin.table('profiles').select('email').eq('username', username).single().execute()
                    if prof_res.data and 'email' in prof_res.data:
                        email = prof_res.data['email']
                except Exception as e:
                    logger.error(f"Failed to lookup email in Supabase: {e}")
                    
            if not email:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Login with Supabase using email+password
            supabase = get_supabase_client()
            auth_res = supabase.auth.sign_in_with_password({
                'email': email,
                'password': password
            })

            if getattr(auth_res, 'user', None) is None:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            user_id = auth_res.user.id

            # Get full profile from Supabase
            admin = get_supabase_admin()
            try:
                profile_res = (
                    admin.table('profiles')
                    .select('*')
                    .eq('id', user_id)
                    .single()
                    .execute()
                )
                profile = profile_res.data
                
                # Auto-repair local FarmerProfile if missing or out of sync
                if not farmer:
                    FarmerProfile.objects.create(
                        supabase_uid=user_id,
                        username=profile.get('username'),
                        full_name=profile.get('full_name'),
                        email=profile.get('email'),
                        state=profile.get('state', ''),
                        district=profile.get('district', ''),
                        farm_size=profile.get('farm_size'),
                        primary_crop=profile.get('primary_crop', ''),
                        profile_complete=profile.get('profile_complete', True)
                    )
                else:
                    # Update local last login
                    FarmerProfile.objects.filter(supabase_uid=user_id).update(last_login=timezone.now())

            except Exception as e:
                logger.error(f"Error syncing profile: {e}")
                if not farmer:
                    return Response({'error': 'Profile sync failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                profile = {
                    'username': farmer.username,
                    'full_name': farmer.full_name,
                    'email': farmer.email,
                    'state': farmer.state,
                    'district': farmer.district,
                    'primary_crop': farmer.primary_crop,
                    'profile_complete': farmer.profile_complete,
                    'total_predictions': farmer.total_predictions,
                }
                FarmerProfile.objects.filter(supabase_uid=user_id).update(last_login=timezone.now())

            return Response({
                'message': 'Login successful',
                'token': auth_res.session.access_token,
                'refresh_token': auth_res.session.refresh_token,
                'user': {
                    'id': user_id,
                    'username': profile.get('username'),
                    'full_name': profile.get('full_name'),
                    'email': profile.get('email'),
                    'state': profile.get('state'),
                    'district': profile.get('district'),
                    'primary_crop': profile.get('primary_crop'),
                    'profile_complete': profile.get('profile_complete'),
                    'total_predictions': profile.get('total_predictions', 0)
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            token = request.headers.get(
                'Authorization', ''
            ).replace('Bearer ', '')
            if token:
                supabase = get_supabase_client()
                supabase.auth.sign_out()
        except Exception:
            pass
        return Response(
            {'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    permission_classes = [AllowAny]

    def _get_user_id(self, token):
        """Validate token and return user_id."""
        supabase = get_supabase_client()
        user_res = supabase.auth.get_user(token)
        return user_res.user.id

    def get(self, request):
        token = request.headers.get(
            'Authorization', ''
        ).replace('Bearer ', '')

        if not token:
            return Response(
                {'error': 'Token required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user_id = self._get_user_id(token)
            admin = get_supabase_admin()
            profile_res = (
                admin.table('profiles')
                .select('*')
                .eq('id', user_id)
                .single()
                .execute()
            )
            return Response(
                profile_res.data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        token = request.headers.get(
            'Authorization', ''
        ).replace('Bearer ', '')

        if not token:
            return Response(
                {'error': 'Token required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user_id = self._get_user_id(token)

            allowed_fields = [
                'full_name', 'state', 'district',
                'farm_size', 'primary_crop', 'preferred_language'
            ]
            update_data = {
                k: v for k, v in request.data.items()
                if k in allowed_fields
            }

            admin = get_supabase_admin()
            admin.table('profiles').update(
                update_data
            ).eq('id', user_id).execute()

            # Sync to Django DB
            FarmerProfile.objects.filter(
                supabase_uid=user_id
            ).update(**{
                k: v for k, v in update_data.items()
                if hasattr(FarmerProfile, k)
            })

            return Response(
                {'message': 'Profile updated successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
