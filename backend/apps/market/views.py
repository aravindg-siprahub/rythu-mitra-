"""
apps/market/views.py
Market price endpoints for Rythu Mitra.
  GET /api/v1/market/prices/        → generic market prices (existing)
  GET /api/v1/market/mandi-price/   → live mandi price from api.data.gov.in
"""
import logging
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# ── api.data.gov.in config ────────────────────────────────────────
AGMARKNET_URL = (
    "https://api.data.gov.in/resource/"
    "9ef84268-d588-465a-a308-a864a43d0070"
)
DATA_GOV_KEY = "579b464db66ec23bdd000001cdd3497f5ce9477d75b26c6d0d539e3"

# ── Existing endpoint (unchanged) ─────────────────────────────────
SAMPLE_PRICES = [
    {"mandi": "Kurnool",  "state": "Andhra Pradesh", "price_per_quintal": 2100, "trend": "Rising"},
    {"mandi": "Guntur",   "state": "Andhra Pradesh", "price_per_quintal": 2050, "trend": "Stable"},
    {"mandi": "Raichur",  "state": "Karnataka",      "price_per_quintal": 1950, "trend": "Falling"},
    {"mandi": "Warangal", "state": "Telangana",      "price_per_quintal": 2000, "trend": "Rising"},
]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def market_prices(request):
    """
    GET /api/v1/market/prices/?crop=Rice&state=Andhra Pradesh
    Returns mandi prices for the given crop and state.
    """
    crop  = request.query_params.get('crop', 'Rice')
    state = request.query_params.get('state', '')

    prices = SAMPLE_PRICES
    if state:
        prices = [p for p in prices if state.lower() in p['state'].lower()] or SAMPLE_PRICES

    return Response({
        'crop':   crop,
        'state':  state or 'All States',
        'prices': prices,
        'source': 'Agmarknet / Rythu Mitra',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mandi_price(request):
    """
    GET /api/v1/market/mandi-price/?commodity=Wheat&district=Kurnool
    Fetches live mandi price from api.data.gov.in server-side.
    No CORS proxy needed — backend makes the request directly.
    """
    commodity = request.query_params.get('commodity', '').strip()
    district  = request.query_params.get('district', '').strip()

    if not commodity or not district:
        return Response(
            {'error': 'Both commodity and district are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    params = {
        'api-key':            DATA_GOV_KEY,
        'format':             'json',
        'limit':              '5',
        'filters[commodity]': commodity,
        'filters[district]':  district,
    }

    try:
        resp = requests.get(
            AGMARKNET_URL,
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data    = resp.json()
        records = data.get('records', [])

        if not records:
            return Response({'commodity': commodity, 'district': district, 'records': []})

        # Sort by most recent arrival date
        records.sort(
            key=lambda r: r.get('arrival_date', ''),
            reverse=True
        )
        latest = records[0]

        return Response({
            'commodity':  latest.get('commodity', commodity),
            'district':   latest.get('district', district),
            'market':     latest.get('market', ''),
            'state':      latest.get('state', ''),
            'minPrice':   float(latest.get('min_price',   0) or 0),
            'maxPrice':   float(latest.get('max_price',   0) or 0),
            'modalPrice': float(latest.get('modal_price', 0) or 0),
            'date':       latest.get('arrival_date', ''),
            'allRecords': records,
        })

    except requests.exceptions.Timeout:
        logger.warning(f"api.data.gov.in timed out for {commodity}/{district}")
        return Response(
            {'error': 'Price data service timed out. Please try again.'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.RequestException as exc:
        logger.error(f"api.data.gov.in error: {exc}")
        return Response(
            {'error': 'Could not fetch price data. Please try again later.'},
            status=status.HTTP_502_BAD_GATEWAY
        )
    except Exception as exc:
        logger.error(f"mandi_price unexpected error: {exc}")
        return Response(
            {'error': 'Internal error fetching mandi price.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
