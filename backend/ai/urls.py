"""
ai/urls.py — AI Module URL Configuration
==========================================
"""

from django.urls import path
from . import views

urlpatterns = [
    # ML Endpoints (PRD v2)
    path("crop-recommend/", views.CropRecommendView.as_view(), name="ai-crop-recommend"),
    path("disease-detect/", views.DiseaseDetectView.as_view(), name="ai-disease-detect"),
    path("disease-result/<str:job_id>/", views.DiseaseResultView.as_view(), name="ai-disease-result"),
    path("market-forecast/", views.MarketForecastView.as_view(), name="ai-market-forecast"),
    path("weather-forecast/", views.WeatherForecastView.as_view(), name="ai-weather-forecast"),
    path("status/", views.MLStatusView.as_view(), name="ai-status"),

    # Existing RAG endpoints
    path("chat/", views.AIChatView.as_view(), name="ai-chat"),
    path("ingest/", views.IngestKnowledgeView.as_view(), name="ai-ingest"),
]
