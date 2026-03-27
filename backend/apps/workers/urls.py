"""
apps/workers/urls.py
URL patterns for workers app — included under /api/v1/workers/
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.worker_list, name='worker_list'),
    path('<int:pk>/', views.worker_detail, name='worker_detail'),
]
