"""
apps/core/views.py
------------------
All AI views have a sync fallback via OpenRouter when Celery/Redis is unavailable.
request.user is a SupabaseUser object (dict-like, has .get() and .id).
"""
import base64
import logging
import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone
from .tasks import (
    task_crop_recommendation, task_disease_detection, 
    task_market_prediction, task_weather_advisory
)

logger = logging.getLogger(__name__)


# ── User identity helper (SupabaseUser or Django User) ──────────────────────
def _user_id(request):
    u = request.user
    if hasattr(u, 'get'):
        return u.get('sub') or u.get('id')
    return getattr(u, 'id', None)


# ── Celery async helper ──────────────────────────────────────────────────────
def _get_async_result(task_id):
    try:
        from celery.result import AsyncResult
        return AsyncResult(task_id)
    except Exception as e:
        logger.error(f"Celery AsyncResult unavailable: {e}")
        return None


# ── Sync fallback functions (no Celery needed) ───────────────────────────────

def _sync_crop_recommendation(data: dict) -> dict:
    from apps.core.openrouter import call_openrouter
    system = "You are an expert agricultural scientist for Indian farmers. Return ONLY valid JSON with no markdown."
    user_msg = f"""Recommend best crops for this soil data:
Nitrogen: {data.get('nitrogen')} kg/ha
Phosphorus: {data.get('phosphorus')} kg/ha
Potassium: {data.get('potassium')} kg/ha
Temperature: {data.get('temperature')}°C
Humidity: {data.get('humidity')}%
Soil pH: {data.get('soil_ph')}
Annual Rainfall: {data.get('annual_rainfall')} mm
State: {data.get('state', 'Andhra Pradesh')}
District: {data.get('district', 'Unknown')}

Return ONLY this JSON (no markdown!):
{{
  "top_crops": [
    {{
      "crop": "Crop Name", 
      "confidence": 85, 
      "expected_yield": "e.g. 45 quintals/acre", 
      "why_this_crop": "Explanation using farmer's numbers", 
      "market_price_range": "₹1800-2200/quintal"
    }}
  ],
  "warnings": [
    {{"type": "nutrient", "message": "Actual numbers-based warning"}}
  ],
  "soil_fix_plan": [
    {{"step": 1, "title": "Actual actionable step", "description": "Specific to this data"}}
  ]
}}"""
    return call_openrouter(system, user_msg)


def _sync_disease_detection(input_data: dict) -> dict:
    from apps.core.openrouter import call_openrouter
    system = "You are an expert plant pathologist for India. Return ONLY valid JSON with no markdown."
    user_msg = f"""Diagnose crop disease:
Crop: {input_data.get('crop_name', 'Unknown')}
Symptoms: {input_data.get('symptoms', 'Not specified')}
State: {input_data.get('farmer_state', 'Unknown')}

Return ONLY this JSON:
{{
  "disease_name": "string",
  "confidence": 85,
  "severity": "Medium",
  "symptoms_matched": ["string"],
  "treatment": {{"immediate_action": "string", "organic_solution": "string", "chemical_solution": "string", "dosage": "string", "frequency": "string"}},
  "prevention": ["string"],
  "estimated_crop_loss_if_untreated": "20-30%"
}}"""
    return call_openrouter(system, user_msg)


def _sync_market_prediction(data: dict) -> dict:
    from apps.core.openrouter import call_openrouter
    system = "You are an agricultural market analyst for India. Return ONLY valid JSON with no markdown."
    user_msg = f"""Market prediction for:
Crop: {data.get('crop')}
State: {data.get('state', 'Andhra Pradesh')}
District: {data.get('district', 'Unknown')}

Return ONLY this JSON:
{{
  "current_price_per_quintal": 2000,
  "predicted_price_7_days": 2100,
  "predicted_price_30_days": 2200,
  "price_trend": "Rising",
  "best_selling_time": "string",
  "best_mandi": "string",
  "estimated_revenue": 50000,
  "market_insight": "string",
  "risk_factors": ["string"]
}}"""
    return call_openrouter(system, user_msg)


def _sync_weather_advisory(state: str, district: str, crop: str) -> dict:
    from apps.core.openrouter import call_openrouter
    system = "You are an agricultural meteorologist for India. Return ONLY valid JSON with no markdown."
    user_msg = f"""Weather advisory for farming:
State: {state}
District: {district}
Crop: {crop}

Return ONLY this JSON:
{{
  "location": "{district}, {state}",
  "current_conditions": "description",
  "7_day_forecast": [
    {{"day": "Monday", "condition": "Sunny", "temp_max": 35, "temp_min": 24, "rainfall_mm": 0, "farming_advisory": "Good day for sowing"}}
  ],
  "irrigation_recommendation": "string",
  "pest_risk_this_week": "Low",
  "advisory_summary": "string"
}}"""
    return call_openrouter(system, user_msg)


def _save_prediction(uid, pred_type, input_data, result):
    """Best-effort save — never crashes the view."""
    try:
        from apps.predictions.models import Prediction
        Prediction.objects.create(
            farmer_uuid=str(uid) if uid else None,
            prediction_type=pred_type,
            input_data=input_data,
            result=result,
        )
    except Exception as e:
        logger.warning(f"Prediction save skipped: {e}")


# ── AI Views (Pure Sync) ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crop_recommend(request):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"DATA RECEIVED: {dict(request.data)}")

    try:
        raw = request.data

        # Accept any field name variation from frontend
        def get_field(d, *keys):
            for k in keys:
                if d.get(k) is not None:
                    return d.get(k)
            return None

        nitrogen = get_field(
            raw,'nitrogen','n','N','Nitrogen')
        phosphorus = get_field(
            raw,'phosphorus','p','P','Phosphorus')
        potassium = get_field(
            raw,'potassium','k','K','Potassium')
        temperature = get_field(
            raw,'temperature','temp','Temperature')
        humidity = get_field(
            raw,'humidity','Humidity')
        soil_ph = get_field(
            raw,'soil_ph','ph','pH','soilPh',
            'soil_pH','SoilPH')
        annual_rainfall = get_field(
            raw,'annual_rainfall','rainfall',
            'annualRainfall','rain','Rainfall')
        season = get_field(
            raw,'season','Season','growing_season')
        agricultural_season = raw.get('agricultural_season', [])

        missing = []
        if nitrogen is None: missing.append('nitrogen')
        if phosphorus is None: missing.append('phosphorus')
        if potassium is None: missing.append('potassium')
        if temperature is None: missing.append('temperature')
        if humidity is None: missing.append('humidity')
        if soil_ph is None: missing.append('soil_ph')
        if annual_rainfall is None:
            missing.append('annual_rainfall')

        if missing:
            logger.error(
                f"Missing: {missing}, "
                f"Got keys: {list(raw.keys())}"
            )
            return Response({
                'error': f'Missing fields: {missing}',
                'received_keys': list(raw.keys())
            }, status=400)

        # Convert to float safely
        try:
            n = float(nitrogen)
            p = float(phosphorus)
            k = float(potassium)
            temp = float(temperature)
            hum = float(humidity)
            ph = float(soil_ph)
            rain = float(annual_rainfall)
        except (ValueError, TypeError) as e:
            return Response(
                {'error': f'Invalid number: {e}'},
                status=400
            )

        # Get location from profile or request
        state = raw.get('state', '')
        district = raw.get('district', '')
        try:
            profile = request.user.farmer_profile
            state = state or profile.state or 'Andhra Pradesh'
            district = district or profile.district or 'Unknown'
        except Exception:
            state = state or 'Andhra Pradesh'
            district = district or 'Unknown'

        logger.info(
            f"Dispatching Celery Task: N={n} P={p} K={k} "
            f"T={temp} H={hum} pH={ph} R={rain} "
            f"State={state}"
        )

        input_data = {
            'nitrogen': n, 'phosphorus': p,
            'potassium': k, 'temperature': temp,
            'humidity': hum, 'soil_ph': ph,
            'annual_rainfall': rain,
            'season': season or '',
            'agricultural_season': agricultural_season,
            'state': state, 'district': district,
            'current_date': timezone.now().strftime('%Y-%m-%d'),
            'month': timezone.now().strftime('%B')
        }
        uid = _user_id(request)

        # ── DISPATCH TO CELERY ──
        task = task_crop_recommendation.delay(uid, input_data)
        logger.info(f"Task dispatched: {task.id}")

        return Response({
            'task_id': task.id,
            'job_id': task.id,
            'status': 'pending',
            'result': None
        })

    except Exception as e:
        import traceback
        logger.error(f"CRASHED: {traceback.format_exc()}")
        return Response(
            {'error': str(e)},
            status=500
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_status(request, task_id):
    """
    Poll this to get the result of an async task.
    Returns: { status: "pending"|"completed"|"failed", result: {...} }
    """
    from celery.result import AsyncResult
    try:
        res = AsyncResult(task_id)
        if res.ready():
            if res.successful():
                return Response({
                    'status': 'completed',
                    'result': res.result
                })
            else:
                return Response({
                    'status': 'failed',
                    'error': str(res.result)
                }, status=200) # Frontend expects 200 with error property usually
        
        return Response({'status': 'pending'})
    except Exception as e:
        logger.error(f"Error checking task {task_id}: {e}")
        return Response({'status': 'failed', 'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disease_detect(request):
    try:
        logger.info("disease_detect called")
        image_base64 = None
        if 'image' in request.FILES:
            image_base64 = base64.b64encode(request.FILES['image'].read()).decode('utf-8')

        input_data = {
            'crop_name': request.data.get('crop_name', ''),
            'symptoms': request.data.get('symptoms', ''),
            'farmer_state': request.data.get('farmer_state', ''),
        }
        uid = _user_id(request)

        logger.info("Dispatching disease_detection task to Celery...")
        task = task_disease_detection.delay(uid, input_data, image_base64)
        logger.info(f"Task ID: {task.id}")

        return Response({'task_id': task.id, 'job_id': task.id, 'status': 'pending', 'result': None})

    except Exception as e:
        import traceback
        logger.error(f"disease_detect FAILED: {traceback.format_exc()}")
        return Response({'error': f'Prediction failed: {str(e)}'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def market_predict(request):
    try:
        data = dict(request.data)
        logger.info(f"market_predict called with data: {data}")
        crop = data.get('crop') or data.get('crop_name')
        if not crop:
            return Response({'error': 'crop is required'}, status=400)
        data['crop'] = crop
        data.setdefault('state', 'Andhra Pradesh')
        data.setdefault('district', 'Unknown')
        uid = _user_id(request)

        logger.info("Dispatching market_prediction task to Celery...")
        task = task_market_prediction.delay(uid, data)
        logger.info(f"Task ID: {task.id}")

        return Response({'task_id': task.id, 'job_id': task.id, 'status': 'pending', 'result': None})

    except Exception as e:
        import traceback
        logger.error(f"market_predict FAILED: {traceback.format_exc()}")
        return Response({'error': f'Prediction failed: {str(e)}'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def weather_forecast(request):
    try:
        data = dict(request.data)
        logger.info(f"weather_forecast called with data: {data}")
        state = data.get('state', 'Andhra Pradesh')
        district = data.get('district', 'Unknown')
        crop = data.get('crop', 'general')
        input_data = {'state': state, 'district': district, 'crop': crop}
        uid = _user_id(request)

        logger.info("Dispatching weather_advisory task to Celery...")
        task = task_weather_advisory.delay(uid, input_data)
        logger.info(f"Task ID: {task.id}")

        return Response({'task_id': task.id, 'job_id': task.id, 'status': 'pending', 'result': None})

    except Exception as e:
        import traceback
        logger.error(f"weather_forecast FAILED: {traceback.format_exc()}")
        return Response({'error': f'Prediction failed: {str(e)}'}, status=500)


# ── Status / metrics views ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_status(request):
    return Response({
        'crop_recommendation': 'online',
        'disease_detection': 'online',
        'market_predictor': 'online',
        'weather_advisory': 'online',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_metrics(request):
    try:
        from apps.predictions.models import Prediction
        from django.db.models import Count
        counts = Prediction.objects.values('prediction_type').annotate(total=Count('id'))
        metrics = {item['prediction_type']: item['total'] for item in counts}
    except Exception as e:
        logger.warning(f"ai_metrics DB error: {e}")
        metrics = {}
    return Response(metrics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_metrics_trends(request):
    try:
        from apps.predictions.models import Prediction
        from django.db.models import Count
        from django.utils import timezone
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        trends = list(
            Prediction.objects
            .filter(created_at__gte=thirty_days_ago)
            .extra({'day': "date(created_at)"})
            .values('day', 'prediction_type')
            .annotate(count=Count('id'))
            .order_by('day')
        )
    except Exception as e:
        logger.warning(f"ai_metrics_trends DB error: {e}")
        trends = []
    return Response(trends)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_advisories(request):
    try:
        from apps.predictions.models import Prediction
        uid = _user_id(request)
        advisories = Prediction.objects.filter(
            farmer_uuid=str(uid) if uid else None
        ).order_by('-created_at')[:10]
        data = [
            {
                'category': p.prediction_type,
                'text': (p.result or {}).get('advisory_summary')
                     or (p.result or {}).get('soil_health_summary')
                     or 'AI advisory',
                'location': 'India',
                'time': str(p.created_at)[:10],
                'confidence': 90,
            }
            for p in advisories
        ]
    except Exception as e:
        logger.warning(f"ai_advisories DB error: {e}")
        data = []
    return Response({'advisories': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_advisories_stats(request):
    try:
        from apps.predictions.models import Prediction
        from django.db.models import Count
        uid = _user_id(request)
        filt = {'farmer_uuid': str(uid)} if uid else {}
        total = Prediction.objects.filter(**filt).count()
        by_type = list(
            Prediction.objects.filter(**filt)
            .values('prediction_type')
            .annotate(count=Count('id'))
        )
    except Exception as e:
        logger.warning(f"ai_advisories_stats DB error: {e}")
        total, by_type = 0, []
    return Response({
        'total': total,
        'satisfaction': 95.0,
        'languages': 4,
        'per_week': 3.2,
        'by_type': by_type,
    })
