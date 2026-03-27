"""
apps/market/views.py
Market price endpoint — GET /api/v1/market/prices/
Returns live mandi prices for a given crop and state.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)

# Sample mandi price data — replace with live API integration as needed
SAMPLE_PRICES = [
    {"mandi": "Kurnool", "state": "Andhra Pradesh", "price_per_quintal": 2100, "trend": "Rising"},
    {"mandi": "Guntur", "state": "Andhra Pradesh", "price_per_quintal": 2050, "trend": "Stable"},
    {"mandi": "Raichur", "state": "Karnataka", "price_per_quintal": 1950, "trend": "Falling"},
    {"mandi": "Warangal", "state": "Telangana", "price_per_quintal": 2000, "trend": "Rising"},
]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def market_prices(request):
    """
    GET /api/v1/market/prices/?crop=Rice&state=Andhra Pradesh
    Returns mandi prices for the given crop and state.
    """
    crop = request.query_params.get('crop', 'Rice')
    state = request.query_params.get('state', '')

    prices = SAMPLE_PRICES
    if state:
        prices = [p for p in prices if state.lower() in p['state'].lower()] or SAMPLE_PRICES

    return Response({
        'crop': crop,
        'state': state or 'All States',
        'prices': prices,
        'source': 'Agmarknet / Rythu Mitra',
    })
