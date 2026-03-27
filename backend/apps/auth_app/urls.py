"""
apps/auth_app/urls.py — auth routes under /api/v1/auth/
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='auth_register'),
    path('login/', views.login, name='auth_login'),
    path('logout/', views.logout, name='auth_logout'),
    path('verify-token/', views.verify_token, name='auth_verify_token'),
    path('token/refresh/', views.refresh_token, name='auth_refresh_token'),
]
