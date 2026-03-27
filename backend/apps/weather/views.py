"""
AI Weather Forecast — POST /api/v1/ai/weather-forecast/
Matches exact frontend endpoint from apiService.js
"""
import asyncio
import logging
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from pydantic import BaseModel, Field, ValidationError
from typing import Optional

from apps.core.openrouter import call_openrouter
from apps.core.supabase_client import supabase
from apps.core.response import success, error

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert agricultural meteorologist and farming advisor for 
Andhra Pradesh and Telangana, India. You specialize in weather-based farming guidance 
for the Rayalaseema, Coastal Andhra, and Telangana regions. Provide precise, actionable 
weather-based farming advisories. Return valid JSON only."""


class WeatherInput(BaseModel):
    district: str = Field(min_length=2, max_length=100, default="Madanapalle")
    current_temp: float = Field(ge=0, le=55, default=28.0)
    current_humidity: float = Field(ge=0, le=100, default=65.0)
    recent_rainfall_7d: float = Field(ge=0, le=500, default=10.0)
    month: int = Field(ge=1, le=12, default=3)
    language: str = 'te'


def fetch_openweather(district: str) -> dict:
    """Fetch real weather from OpenWeatherMap API."""
    from decouple import config
    api_key = config('OPENWEATHER_API_KEY', default='')
    if not api_key:
        return {}

    try:
        # Current weather
        current_resp = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": f"{district},IN", "appid": api_key, "units": "metric"},
            timeout=10,
        )
        current = current_resp.json() if current_resp.status_code == 200 else {}

        # 5-day forecast
        forecast_resp = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={"q": f"{district},IN", "appid": api_key, "units": "metric", "cnt": 40},
            timeout=10,
        )
        forecast = forecast_resp.json() if forecast_resp.status_code == 200 else {}

        return {"current": current, "forecast": forecast}
    except Exception as e:
        logger.warning(f"OpenWeather fetch failed for {district}: {e}")
        return {}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def weather_forecast(request):
    """
    POST /api/v1/ai/weather-forecast/
    Input: { district, current_temp, current_humidity, recent_rainfall_7d, month }
    Returns: { status, district, forecast, risk }
    """
    user_id = request.user.get('sub')

    try:
        data = WeatherInput(**request.data)
    except ValidationError as e:
        return error("Invalid input.", code="VALIDATION_ERROR", details=e.errors(), status=400)

    # Try live OpenWeather data
    live_weather = fetch_openweather(data.district)
    has_live = bool(live_weather.get('current', {}).get('main'))

    if has_live:
        current = live_weather['current']
        actual_temp = current.get('main', {}).get('temp', data.current_temp)
        actual_humidity = current.get('main', {}).get('humidity', data.current_humidity)
        actual_rainfall = current.get('rain', {}).get('1h', 0) * 24
        weather_desc = current.get('weather', [{}])[0].get('description', '')
        forecast_list = live_weather.get('forecast', {}).get('list', [])[:8]
        weather_context = f"LIVE OpenWeatherMap data: temp={actual_temp}°C, humidity={actual_humidity}%, rainfall_today={actual_rainfall}mm, condition={weather_desc}, 3-day forecast={forecast_list}"
    else:
        actual_temp = data.current_temp
        actual_humidity = data.current_humidity
        actual_rainfall = data.recent_rainfall_7d
        weather_context = f"Farmer-reported: temp={actual_temp}°C, humidity={actual_humidity}%, recent_rainfall_7d={actual_rainfall}mm, month={data.month}"

    user_prompt = f"""Weather-based farming advisory for: {data.district}, Andhra Pradesh
{weather_context}

Provide comprehensive farm advisory. Return ONLY this JSON:
{{
  "district": "{data.district}",
  "status": "success",
  "current_conditions": {{
    "temperature": {actual_temp},
    "humidity": {actual_humidity},
    "rainfall_today_mm": {actual_rainfall},
    "condition": "Partly cloudy",
    "farming_suitability": "good"
  }},
  "forecast": [
    {{"day": "Today", "temp_high": 32, "temp_low": 22, "rain_probability": 20, "rainfall_mm": 5, "suitability": "good", "advisory": "Good day for field work"}},
    {{"day": "Tomorrow", "temp_high": 31, "temp_low": 23, "rain_probability": 40, "rainfall_mm": 10, "suitability": "moderate", "advisory": "Check irrigation needs"}},
    {{"day": "Day 3", "temp_high": 29, "temp_low": 21, "rain_probability": 70, "rainfall_mm": 25, "suitability": "poor", "advisory": "Avoid spraying — rain expected"}},
    {{"day": "Day 4", "temp_high": 30, "temp_low": 22, "rain_probability": 30, "rainfall_mm": 8, "suitability": "good", "advisory": "Resume normal activities"}},
    {{"day": "Day 5", "temp_high": 33, "temp_low": 24, "rain_probability": 15, "rainfall_mm": 2, "suitability": "excellent", "advisory": "Best day for harvesting"}}
  ],
  "risk": {{
    "flood_risk": "low",
    "drought_risk": "medium",
    "heat_risk": "low",
    "overall_risk": "low",
    "flood_risk_score": 15,
    "drought_risk_score": 45,
    "heat_risk_score": 20,
    "overall_risk_score": 25
  }},
  "alerts": [],
  "farming_advisory": {{
    "irrigation_needed": true,
    "safe_spray_days": ["Today", "Day 4"],
    "avoid_spray_days": ["Day 3"],
    "harvest_window": "Days 4-5 are optimal for harvest",
    "this_week_tasks": ["Irrigate groundnut fields", "Apply top dressing fertilizer", "Monitor for pest activity"],
    "today_tasks": ["Check soil moisture", "Inspect crop for pest damage"]
  }},
  "english_advisory": "This week's weather forecast: Good weather today. Go ahead and irrigate the field."
}}"""

    try:
        ai_result = call_openrouter(SYSTEM_PROMPT, user_prompt)
    except Exception as e:
        logger.error(f"Weather AI failed: {e}")
        # Return a safe fallback instead of 503
        ai_result = {
            "district": data.district,
            "status": "success",
            "current_conditions": {"temperature": actual_temp, "humidity": actual_humidity, "rainfall_today_mm": actual_rainfall, "condition": "Unknown", "farming_suitability": "moderate"},
            "forecast": [],
            "risk": {"flood_risk": "low", "drought_risk": "medium", "heat_risk": "low", "overall_risk": "low"},
            "alerts": [],
            "farming_advisory": {"this_week_tasks": ["Monitor crops"], "today_tasks": ["Check soil moisture"]},
            "english_advisory": "Weather information is currently unavailable."
        }

    # Save to Supabase
    if user_id:
        try:
            supabase.table('weather_queries').insert({
                "user_id": str(user_id),
                "location": data.district,
                "weather_data": {"temp": actual_temp, "humidity": actual_humidity, "has_live": has_live},
                "farm_advice": ai_result,
                "language": data.language,
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save weather query: {e}")

    return success({
        "status": "success",
        "district": data.district,
        **ai_result,
    })
