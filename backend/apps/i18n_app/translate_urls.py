"""
apps/i18n_app/translate_urls.py — included under /api/v1/translate/
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.translate_text, name='translate_text'),
]
