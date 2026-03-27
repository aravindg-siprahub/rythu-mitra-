"""
apps/market/market_urls.py
URL patterns for market app — included under /api/v1/market/
"""
from django.urls import path
from . import views

urlpatterns = [
    path('prices/', views.market_prices, name='market_prices'),
]
