"""
apps/auth_app/profile_urls.py — profile sub-routes under /api/v1/auth/profile/
"""
from django.urls import path
from . import profile_views

urlpatterns = [
    path('', profile_views.get_profile, name='profile_get'),
    path('update/', profile_views.update_profile, name='profile_update'),
]
