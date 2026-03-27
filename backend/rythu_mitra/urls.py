"""
Rythu Mitra — Root URL Configuration
All API routes versioned under /api/v1/ to match existing frontend calls.
"""
import logging
from django.urls import path, include
from django.http import JsonResponse
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

from apps.core.views import (
    crop_recommend, disease_detect, market_predict, weather_forecast,
    task_status, ai_status, ai_metrics, ai_metrics_trends, ai_advisories, ai_advisories_stats
)

# Supabase Persistence Audit & Fixes
# - [x] Audit Crop Recommendation persistence (`crop_recommendations`)
# - [x] Audit Market Prediction persistence (`market_price_queries`)
# - [x] Audit Weather Advisory persistence (`weather_queries`)
# - [x] Audit User Profiles persistence (`profiles`)
# - [x] Implement missing Supabase inserts in `tasks.py` and consolidated routes
# - [x] Verify all tables are receiving data correctly

from apps.farmers.views import (
    national_summary, farmers_by_state, farmers_recent
)
from apps.market.views import market_prices


def health_check(request):
    from apps.core.supabase_client import supabase
    from decouple import config

    supa_status = 'unknown'
    try:
        supabase.table('workers').select('id').limit(1).execute()
        supa_status = 'connected'
    except Exception as e:
        logger.warning(f"Supabase health check failed: {e}")
        supa_status = 'error'

    return JsonResponse({
        'status': 'ok',
        'version': '1.0.0',
        'supabase': supa_status,
        'openrouter': 'configured' if config('OPENROUTER_API_KEY', default='') else 'not_configured',
        'timestamp': datetime.now(timezone.utc).isoformat(),
    })


urlpatterns = [
    path('api/v1/health/', health_check, name='health_check'),
    path('api/v1/auth/', include('apps.auth_app.urls')),
    path('api/v1/auth/profile/', include('apps.auth_app.profile_urls')),
    path('api/v1/market/', include('apps.market.market_urls')),
    path('api/v1/workers/', include('apps.workers.urls')),
    path('api/v1/transport/', include('apps.transport.urls')),
    path('api/v1/i18n/', include('apps.i18n_app.urls')),
    path('api/v1/translate/', include('apps.i18n_app.translate_urls')),
    # NOTE: metrics, advisories, status, farmers → now served by new views below

    # AI endpoints
    path('api/v1/ai/crop-recommend/', crop_recommend),
    path('api/v1/ai/disease-detect/', disease_detect),
    path('api/v1/ai/market-predict/', market_predict),
    path('api/v1/ai/weather-forecast/', weather_forecast),
    path('api/v1/ai/task/<str:task_id>/', task_status),
    path('api/v1/ai/disease-result/<str:task_id>/', task_status), # Alias for legacy polling
    path('api/v1/ai/status/', ai_status),
    path('api/v1/ai/metrics/', ai_metrics),
    path('api/v1/ai/metrics/trends/', ai_metrics_trends),
    path('api/v1/ai/advisories/', ai_advisories),
    path('api/v1/ai/advisories/stats/', ai_advisories_stats),

    # Farmer endpoints
    path('api/v1/farmers/kpi/national-summary/', national_summary),
    path('api/v1/farmers/by-state/', farmers_by_state),
    path('api/v1/farmers/recent/', farmers_recent),

    # Market
    path('api/v1/market/prices/', market_prices),

    # Work Module — Unified Job Board & Bookings
    path("api/v1/work/", include("apps.work.urls")),
]
