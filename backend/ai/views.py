"""
ai/views.py — Rythu Mitra AI API Endpoints
===========================================
All ML logic lives in ml_factory/ — views only handle HTTP I/O,
validation, OpenRouter advisory calls, and telemetry logging.

Endpoints:
  POST /api/v1/ai/crop-recommend/
  POST /api/v1/ai/disease-detect/
  GET  /api/v1/ai/disease-result/{job_id}/
  POST /api/v1/ai/market-forecast/
  POST /api/v1/ai/weather-forecast/
  POST /api/v1/ai/chat/           (existing RAG endpoint)
"""

import os
import uuid
import time
import json
import hashlib
import logging
import requests as http_requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.files.storage import default_storage

from .model_loader import ModelLoader
from .models import PredictionLog, CropPrediction, DiseasePrediction

logger = logging.getLogger(__name__)


# ── OpenRouter Advisory Helper ────────────────────────────────────────────────
def _call_openrouter_advisory(prompt: str) -> str:
    """Call OpenRouter for farmer-facing advisory text. Returns text or fallback."""
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        return "Advisory unavailable — OpenRouter API key not configured."
    # Use gpt-3.5-turbo as default (gemini-flash-1.5 returns 404 on OpenRouter)
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")
    if "gemini-flash-1.5" in model:
        model = "openai/gpt-3.5-turbo"  # Auto-correct known-bad model ID
    try:
        resp = http_requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 150,
                "temperature": 0.7,
            },
            timeout=10,
        )
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"].strip()
        else:
            # Surface the actual error so it appears in Django console
            err = resp.json().get("error", {}).get("message", resp.text[:120])
            print(f"[OpenRouter] Non-200 ({resp.status_code}) model={model}: {err}")
            logger.warning(f"[OpenRouter] {resp.status_code} model={model}: {err}")
    except Exception as e:
        logger.warning(f"[OpenRouter] Advisory call failed: {e}")
        print(f"[OpenRouter] Exception: {type(e).__name__}: {e}")
    return "Advisory unavailable — please consult a local agricultural officer."


def _log_prediction(domain: str, model_version: str, input_hash: str,
                    inference_ms: int, confidence: float = None,
                    farmer_id=None, error: str = None):
    """Log telemetry for every inference call."""
    try:
        PredictionLog.objects.create(
            farmer_id=farmer_id,
            domain=domain,
            model_version=model_version,
            input_hash=input_hash,
            inference_ms=inference_ms,
            confidence_score=confidence,
            error_message=error,
        )
    except Exception as e:
        logger.error(f"[Telemetry] Failed to log prediction: {e}")


# ══════════════════════════════════════════════════════════════════════════════
# CROP RECOMMENDATION
# ══════════════════════════════════════════════════════════════════════════════
class CropRecommendView(APIView):
    """POST /api/v1/ai/crop-recommend/"""

    def post(self, request):
        from ml_factory.crop.inference import predict, validate_input

        t_start = time.perf_counter()

        data = request.data
        is_valid, errors = validate_input(data)
        if not is_valid:
            return Response(
                {"status": "validation_error", "errors": errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        models = ModelLoader.get_crop_models()
        t0 = time.perf_counter()
        result = predict(data, models)
        t1 = time.perf_counter()
        inference_ms = round((t1 - t0) * 1000)

        http_code = result.pop("http_status", 200)

        advisory_ms = 0
        if result.get("status") == "success":
            # Call OpenRouter for top recommendation advisory
            top = result["recommendations"][0]
            shap_top = result.get("shap_top_features", ["soil", "climate"])
            prompt = (
                f"Farmer input: N={data.get('N')}kg/ha, P={data.get('P')}kg/ha, "
                f"K={data.get('K')}kg/ha, temp={data.get('temperature')}°C, "
                f"humidity={data.get('humidity')}%, pH={data.get('ph')}, "
                f"rainfall={data.get('rainfall')}mm/year. "
                f"ML model recommends {top['crop']} "
                f"({top['confidence_pct']:.0f}% confidence). "
                f"Key soil factors: {', '.join(shap_top[:3])}. "
                "Write 2 sentences of simple farming advice in English. "
                "No technical jargon. Start with 'Your soil is best suited for'"
            )
            t2 = time.perf_counter()
            advisory = _call_openrouter_advisory(prompt)
            t3 = time.perf_counter()
            advisory_ms = round((t3 - t2) * 1000)

            for rec in result.get("recommendations", []):
                rec["explanation"]["farmer_advisory"] = advisory

            # Add timing to response so frontend can display it
            total_ms = round((t3 - t_start) * 1000)
            result["timing"] = {
                "inference_ms": inference_ms,
                "advisory_ms": advisory_ms,
                "total_ms": total_ms,
            }

            # Diagnostic log
            print(f"[CropView] Model load: pre-cached | Inference: {inference_ms}ms "
                  f"| OpenRouter: {advisory_ms}ms | Total: {total_ms}ms")

            # Save to DB
            try:
                CropPrediction.objects.create(
                    farmer_id=data.get("farmer_id"),
                    n=float(data.get("N", 0)),
                    p=float(data.get("P", 0)),
                    k=float(data.get("K", 0)),
                    temperature=float(data.get("temperature", 0)),
                    humidity=float(data.get("humidity", 0)),
                    ph=float(data.get("ph", 0)),
                    rainfall=float(data.get("rainfall", 0)),
                    recommended_crop=top["crop"],
                    confidence=top["confidence"],
                    risk_level=top["risk_level"],
                    model_version=result.get("model_version", ""),
                )
            except Exception as e:
                logger.warning(f"[CropView] DB save failed: {e}")

            # Telemetry
            _log_prediction(
                domain="crop",
                model_version=result.get("model_version", ""),
                input_hash=result.get("input_hash", ""),
                inference_ms=inference_ms,
                confidence=top["confidence"],
                farmer_id=data.get("farmer_id"),
            )

        return Response(result, status=http_code)


# ══════════════════════════════════════════════════════════════════════════════
# DISEASE DETECTION
# ══════════════════════════════════════════════════════════════════════════════
class DiseaseDetectView(APIView):
    """POST /api/v1/ai/disease-detect/  — accepts image, returns job_id."""

    def post(self, request):
        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"status": "error", "message": "Image file required (field: 'image')"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate format
        ext = os.path.splitext(image_file.name)[1].lower()
        if ext not in (".jpg", ".jpeg", ".png"):
            return Response(
                {"status": "validation_error", "message": "Only .jpg and .png images accepted"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Validate size (5MB max for 8GB RAM system)
        if image_file.size > 5 * 1024 * 1024:
            return Response(
                {"status": "validation_error",
                 "message": f"Image too large: {image_file.size/1e6:.1f}MB (max 5MB)"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Save image
        job_id = str(uuid.uuid4())[:8]
        upload_dir = os.path.join(settings.MEDIA_ROOT, "disease_uploads")
        os.makedirs(upload_dir, exist_ok=True)
        save_path = os.path.join(upload_dir, f"{job_id}{ext}")
        with open(save_path, "wb") as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        # Create pending record
        try:
            DiseasePrediction.objects.create(
                farmer_id=request.data.get("farmer_id"),
                image_path=save_path,
                disease="pending",
                confidence=0.0,
                severity="pending",
                risk_level="pending",
                model_version="ResNet18_v1.0",
                job_id=job_id,
                status="pending",
            )
        except Exception as e:
            logger.error(f"[DiseaseView] DB create failed: {e}")

        # Dispatch Celery task (or run synchronously if Celery unavailable)
        try:
            from .tasks import run_disease_inference
            run_disease_inference.delay(job_id, save_path)
        except Exception as e:
            logger.warning(f"[DiseaseView] Celery dispatch failed: {e}. Running synchronously.")
            self._run_sync(job_id, save_path, request.data.get("farmer_id"))

        return Response(
            {"status": "accepted", "job_id": job_id,
             "message": "Image uploaded. Check /api/v1/ai/disease-result/{job_id}/ for results."},
            status=status.HTTP_202_ACCEPTED,
        )

    def _run_sync(self, job_id: str, image_path: str, farmer_id=None):
        """Fallback synchronous inference when Celery is unavailable."""
        try:
            from ml_factory.disease.inference import load_disease_model, predict_from_bytes
            models_dir = os.path.join(settings.BASE_DIR, "ai", "models")
            assets = load_disease_model(models_dir)
            with open(image_path, "rb") as f:
                image_bytes = f.read()
            result = predict_from_bytes(image_bytes, assets)

            DiseasePrediction.objects.filter(job_id=job_id).update(
                disease=result.get("disease", "Unknown"),
                confidence=result.get("confidence", 0),
                severity=result.get("severity", "Unknown"),
                risk_level=result.get("risk_level", "Unknown"),
                status="completed",
                result_json=result,
            )

            _log_prediction(
                domain="disease",
                model_version=result.get("model_version", ""),
                input_hash=result.get("input_hash", ""),
                inference_ms=result.get("inference_ms", 0),
                confidence=result.get("confidence"),
                farmer_id=farmer_id,
            )
        except Exception as e:
            logger.error(f"[DiseaseView] Sync inference failed: {e}")
            DiseasePrediction.objects.filter(job_id=job_id).update(
                status="failed",
                result_json={"error": str(e)},
            )


class DiseaseResultView(APIView):
    """GET /api/v1/ai/disease-result/{job_id}/"""

    def get(self, request, job_id):
        try:
            pred = DiseasePrediction.objects.get(job_id=job_id)
        except DiseasePrediction.DoesNotExist:
            return Response(
                {"status": "error", "message": f"Job {job_id} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if pred.status == "pending":
            return Response(
                {"status": "pending", "job_id": job_id,
                 "message": "Still processing. Check again shortly."},
                status=status.HTTP_202_ACCEPTED,
            )

        result = pred.result_json or {}
        if pred.status == "completed" and result.get("disease") and result["disease"] != "Uncertain":
            # Add OpenRouter advisory
            prompt = (
                f"A farmer's {result.get('disease', 'crop')} was detected with "
                f"{result.get('confidence_pct', result.get('confidence', 0)):.0f}% confidence. "
                f"Severity: {result.get('severity', 'unknown')}. "
                "Write 2 sentences of simple treatment advice for an Indian farmer. "
                "Include one organic remedy and one chemical option. No technical jargon."
            )
            result["farmer_advisory"] = _call_openrouter_advisory(prompt)

        return Response(
            {"status": pred.status, "job_id": job_id, "result": result},
            status=status.HTTP_200_OK,
        )


# ══════════════════════════════════════════════════════════════════════════════
# MARKET FORECAST
# ══════════════════════════════════════════════════════════════════════════════
class MarketForecastView(APIView):
    """POST /api/v1/ai/market-forecast/"""

    def post(self, request):
        from ml_factory.market.inference import load_market_models, predict_market

        data = request.data
        if not data.get("crop_name"):
            return Response(
                {"status": "validation_error", "message": "crop_name is required"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        models_dir = os.path.join(settings.BASE_DIR, "ai", "models")
        market_models = load_market_models(models_dir)
        result = predict_market(data, market_models)

        http_code = result.pop("http_status", 200)

        if result.get("status") == "success":
            _log_prediction(
                domain="market",
                model_version=result.get("model_version", ""),
                input_hash=result.get("input_hash", ""),
                inference_ms=result.get("inference_ms", 0),
                confidence=result.get("confidence"),
                farmer_id=data.get("farmer_id"),
            )

        return Response(result, status=http_code)


# ══════════════════════════════════════════════════════════════════════════════
# WEATHER FORECAST
# ══════════════════════════════════════════════════════════════════════════════
class WeatherForecastView(APIView):
    """POST /api/v1/ai/weather-forecast/"""

    def post(self, request):
        from ml_factory.weather.inference import load_weather_models, predict_weather

        data = request.data
        models_dir = os.path.join(settings.BASE_DIR, "ai", "models")
        weather_assets = load_weather_models(models_dir)
        result = predict_weather(data, weather_assets)

        http_code = result.pop("http_status", 200)

        if result.get("status") == "success":
            _log_prediction(
                domain="weather",
                model_version=result.get("model_version", ""),
                input_hash=result.get("input_hash", ""),
                inference_ms=result.get("inference_ms", 0),
                farmer_id=data.get("farmer_id"),
            )

        return Response(result, status=http_code)


# ══════════════════════════════════════════════════════════════════════════════
# EXISTING RAG ENDPOINTS (kept unchanged)
# ══════════════════════════════════════════════════════════════════════════════
class AIChatView(APIView):
    """Endpoint for AI Chatbot interactions using RAG."""

    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .rag_service import RAGService
            rag = RAGService()
            answer = rag.query(query)
            return Response(
                {"response": answer, "source": "neural_engine_v2"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"AI Error: {e}")
            return Response(
                {"response": "I am currently offline. Please try again later.", "error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class IngestKnowledgeView(APIView):
    """Add knowledge to RAG system."""

    def post(self, request):
        text = request.data.get("text")
        metadata = request.data.get("metadata", {})
        if not text:
            return Response({"error": "Text content is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from .rag_service import RAGService
            rag = RAGService()
            success = rag.add_document(text, metadata)
            if success:
                return Response({"message": "Knowledge ingested successfully"}, status=status.HTTP_201_CREATED)
            return Response({"error": "Failed to ingest knowledge"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ══════════════════════════════════════════════════════════════════════════════
# ML STATUS ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════
class MLStatusView(APIView):
    """GET /api/v1/ai/status/ — health check for loaded models."""

    def get(self, request):
        return Response({
            "status": "ok",
            "models": ModelLoader.status(),
        }, status=status.HTTP_200_OK)
