"""
apps/i18n_app/urls.py — included under /api/v1/i18n/
"""
from django.urls import path
from . import views

urlpatterns = [
    path('languages/', views.languages_list, name='languages_list'),
]
