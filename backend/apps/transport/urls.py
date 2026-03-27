"""
apps/transport/urls.py
URL patterns for transport app — included under /api/v1/transport/
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.transport_list, name='transport_list'),
]
