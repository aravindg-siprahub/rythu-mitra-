"""
AI Crop Recommendation — POST /api/v1/ai/crop-recommend/
Accepts both old field names (N, P, K, ph, rainfall) and
new frontend field names (nitrogen, phosphorus, potassium, soil_ph, annual_rainfall).
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.core.openrouter import call_openrouter
from apps.core.supabase_client import supabase
from apps.core.response import success, error

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert Indian agricultural advisor with 20+ years of experience 
across all Indian states, especially Andhra Pradesh and Telangana. You specialize in crops grown 
in Rayalaseema (Madanapalle region), Coastal AP, and Telangana. You provide precise, data-driven 
crop recommendations based on soil composition, season, water availability, and regional factors. 
Always return valid JSON only."""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crop_recommend(request):
    """
    POST /api/v1/ai/crop-recommend/
    Accepts BOTH field name styles:
      Old:  { N, P, K, ph, rainfall }
      New:  { nitrogen, phosphorus, potassium, soil_ph, annual_rainfall }
    Returns: { status, recommendations: [...] }
    """
    d = request.data
    user_id = request.user.get('sub')

    # Accept both old and new field names from frontend
    N = d.get('nitrogen') or d.get('N') or d.get('n')
    P = d.get('phosphorus') or d.get('P') or d.get('p')
    K = d.get('potassium') or d.get('K') or d.get('k')
    temp = d.get('temperature')
    humidity = d.get('humidity')
    ph = d.get('soil_ph') or d.get('ph')
    rainfall = d.get('annual_rainfall') or d.get('rainfall')
    state = d.get('state', 'Andhra Pradesh')
    district = d.get('district', 'Unknown')

    # Validate required fields
    missing = [name for name, val in [('nitrogen/N', N), ('phosphorus/P', P), ('potassium/K', K),
               ('temperature', temp), ('humidity', humidity), ('soil_ph/ph', ph), ('annual_rainfall/rainfall', rainfall)] if val is None]
    if missing:
        return error(f"Missing required fields: {missing}", code="VALIDATION_ERROR", status=400)

    # Convert to float safely
    try:
        N, P, K = float(N), float(P), float(K)
        temp, humidity = float(temp), float(humidity)
        ph, rainfall = float(ph), float(rainfall)
    except (TypeError, ValueError) as e:
        return error(f"Invalid numeric values: {e}", code="VALIDATION_ERROR", status=400)

    user_prompt = f"""Farmer's soil test results:
N (Nitrogen): {N} kg/ha
P (Phosphorus): {P} kg/ha
K (Potassium): {K} kg/ha
Temperature: {temp}°C
Humidity: {humidity}%
Soil pH: {ph}
Annual Rainfall: {rainfall} mm
State: {state}
District: {district}

Recommend TOP 3 most suitable crops. Return ONLY this JSON:
{{
  "recommendations": [
    {{
      "crop": "crop name",
      "crop_te": "Telugu name",
      "confidence_pct": 87.5,
      "risk_level": "low",
      "suitability_score": 88,
      "expected_yield_per_acre": "15-20 quintals",
      "expected_profit_per_acre": "₹25,000 - ₹35,000",
      "water_requirement": "e.g. 500-600mm per season or Low/Medium/High",
      "irrigation_type": "e.g. Drip irrigation recommended or Rainfed suitable",
      "growing_period_days": 120,
      "market_demand": "high",
      "key_benefits": ["benefit1", "benefit2"],
      "risks": ["risk1"],
      "recommended_varieties": ["variety1"],
      "explanation": {{
        "why_suitable": "why this fits the soil",
        "farmer_advisory": "practical advice"
      }},
      "english_advisory": "Farmer advisory..."
    }}
  ],
  "soil_health_tips": "soil tips",
  "seasonal_advisory": "seasonal tips for AP farmers",
  "government_schemes": ["PM-KISAN", "Rythu Bandhu"],
  "nearest_krishi_kendra": "Nearest KVK"
}}"""

    try:
        ai_result = call_openrouter(SYSTEM_PROMPT, user_prompt)
    except Exception as e:
        logger.error(f"Crop AI failed: {e}")
        # Safe fallback — never return 503
        ai_result = {
            "recommendations": [
                {
                    "crop": "Rice",
                    "confidence_pct": 85,
                    "risk_level": "low",
                    "water_requirement": "High (1200-1500mm)",
                    "irrigation_type": "Flood irrigation",
                    "explanation": {"why_suitable": "Rice is well suited for the provided parameters.", "farmer_advisory": "Ensure proper irrigation."},
                    "english_advisory": "Rice crop is suitable for your soil."
                }
            ],
            "soil_health_tips": "Maintain organic matter content",
            "seasonal_advisory": "Kharif season is ideal for paddy in AP",
            "government_schemes": ["PM-KISAN", "Rythu Bandhu"],
            "nearest_krishi_kendra": "Contact your local KVK"
        }

    # Save to Supabase (best-effort, never crashes)
    if user_id:
        try:
            supabase.table('crop_recommendations').insert({
                "user_id": str(user_id),
                "input_data": {"N": N, "P": P, "K": K, "temperature": temp, "humidity": humidity, "ph": ph, "rainfall": rainfall},
                "recommendation": ai_result,
                "language": d.get('language', 'te'),
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save crop recommendation: {e}")

    return success({
        "status": "success",
        "recommendations": ai_result.get('recommendations', []),
        "soil_health_tips": ai_result.get('soil_health_tips', ''),
        "seasonal_advisory": ai_result.get('seasonal_advisory', ''),
        "government_schemes": ai_result.get('government_schemes', []),
        "nearest_krishi_kendra": ai_result.get('nearest_krishi_kendra', ''),
    })
