"""
AI Disease Detection — POST /api/v1/ai/disease-detect/
GET /api/v1/ai/disease-result/{job_id}/
"""
import uuid
import asyncio
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from pydantic import BaseModel, Field, ValidationError
from typing import Optional

from apps.core.openrouter import call_openrouter
from apps.core.supabase_client import supabase
from apps.core.response import success, error
from apps.core.validators import sanitize_text, validate_image_magic_bytes

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert plant pathologist with deep knowledge of diseases 
affecting Indian crops, especially those grown in Andhra Pradesh and Telangana: 
paddy/rice, groundnut, cotton, chilli, tomato, tobacco, sugarcane, maize, and pulses.
Provide accurate diagnosis and actionable organic + chemical treatment plans.
Return valid JSON only."""


class DiseaseInput(BaseModel):
    crop_name: str = Field(default='Unknown', max_length=50)
    symptoms: str = Field(default='', max_length=1000)
    affected_area_percent: int = Field(ge=1, le=100, default=20)
    plant_age_days: Optional[int] = Field(default=None, ge=1)
    weather_condition: Optional[str] = Field(default=None, max_length=200)
    language: str = 'te'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disease_detect(request):
    """
    POST /api/v1/ai/disease-detect/
    Accepts both JSON and multipart form data (with optional image).
    """
    user_id = request.user.get('sub')
    raw = request.data

    # Handle both JSON and multipart (for image uploads)
    try:
        data = DiseaseInput(
            crop_name=sanitize_text(str(raw.get('crop_name', raw.get('cropName', 'Unknown')))),
            symptoms=sanitize_text(str(raw.get('symptoms', ''))),
            affected_area_percent=int(raw.get('affected_area_percent', raw.get('affectedArea', 20))),
            plant_age_days=raw.get('plant_age_days') or raw.get('plantAgeDays'),
            weather_condition=sanitize_text(str(raw.get('weather_condition', ''))) or None,
            language=raw.get('language', 'te'),
        )
    except ValidationError as e:
        return error("Invalid input.", code="VALIDATION_ERROR", details=e.errors(), status=400)

    # Handle image upload if provided
    image_url = None
    image_file = request.FILES.get('image')
    if image_file:
        try:
            img_type = validate_image_magic_bytes(image_file)
            ext_map = {'jpeg': 'jpg', 'png': 'png', 'webp': 'webp'}
            ext = ext_map.get(img_type, 'jpg')
            filename = f"{uuid.uuid4()}.{ext}"
            image_file.seek(0)
            file_bytes = image_file.read()

            # Upload to Supabase Storage
            supabase.storage.from_('disease-images').upload(
                path=filename,
                file=file_bytes,
                file_options={"content-type": f"image/{img_type}"},
            )
            from decouple import config
            image_url = f"{config('SUPABASE_URL', '')}/storage/v1/object/public/disease-images/{filename}"
        except ValueError as e:
            return error(str(e), code="INVALID_IMAGE", status=400)
        except Exception as e:
            logger.warning(f"Image upload failed: {e}")
            # Continue without image

    user_prompt = f"""Visual image analysis task. Carefully look at the uploaded plant image.
Crop (farmer’s hint, may be ‘Unknown’): {data.crop_name}
Farmer-reported symptoms: {data.symptoms or 'Not provided — diagnose from image only'}
Affected area: {data.affected_area_percent}%
Plant age: {data.plant_age_days or 'Unknown'} days
Weather: {data.weather_condition or 'Not provided'}
Region: Andhra Pradesh / Telangana

First identify the plant (if crop is Unknown). Then diagnose any disease visible in the image.
If the leaf looks healthy, set disease_name to “Healthy Plant” and severity to “none”.
Return ONLY this JSON:
{{
  "disease_name": "Disease name",
  "disease_name_local": "వ్యాధి పేరు తెలుగులో",
  "confidence_percent": 85,
  "severity": "moderate",
  "description": "What this disease is",
  "cause": "Causal organism",
  "spread_risk": "high",
  "immediate_actions": ["Action 1 to do TODAY", "Action 2"],
  "organic_treatment": ["Organic remedy 1", "Neem-based spray"],
  "chemical_treatment": [
    {{"product_name": "Mancozeb 75% WP", "dosage": "2g/L water", "frequency": "Every 7 days", "price_range": "₹150-200 per kg"}}
  ],
  "preventive_measures": ["Prevention tip 1", "Prevention tip 2"],
  "recovery_timeline": "7-14 days with treatment",
  "estimated_yield_loss": "20-30% if untreated",
  "nearby_crop_risk": true,
  "consult_expert_if": "Condition worsens after 5 days of treatment",
  "farmer_advisory": "2-3 sentence practical Telugu/English farmer advisory"
}}"""

    # Pass image if available (Base64 for task)
    img_b64 = None
    if image_file:
        import base64
        image_file.seek(0)
        img_b64 = base64.b64encode(image_file.read()).decode('utf-8')

    # Prepare input for task
    task_input = {
        "crop_name": data.crop_name,
        "symptoms": data.symptoms,
        "language": data.language,
        "image_url": image_url,
        "farmer_state": data.weather_condition or "Telangana",
        # Weather + location context forwarded from frontend
        "temperature": raw.get("temperature", 28),
        "humidity":    raw.get("humidity", 65),
        "district":    raw.get("district", ""),
        "state":       raw.get("state", "Andhra Pradesh"),
        "season":      raw.get("season", "Kharif"),
    }

    from apps.core.tasks import task_disease_detection
    job = task_disease_detection.delay(user_id, task_input, img_b64)

    return success({
        "status": "pending",
        "job_id": job.id,
        "message": "Analysis started. Please poll for results."
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def disease_result(request, job_id):
    """
    GET /api/v1/ai/disease-result/{job_id}/
    Checks Celery task status and returns result.
    """
    from celery.result import AsyncResult
    res = AsyncResult(job_id)

    if res.ready():
        if res.successful():
            # Task finished successfully — result is the AI dict
            ai_data = res.result
            
            # Return result immediately
            return success({
                "status": "completed",
                "job_id": job_id,
                "result": ai_data
            })
        else:
            # Task failed
            return success({
                "status": "failed",
                "job_id": job_id,
                "error": str(res.result)
            })
    
    # Task still in progress
    return success({
        "status": "pending",
        "job_id": job_id
    })
