"""
ai/tasks.py — Celery Tasks for AI Module
==========================================
Async disease inference task.
"""

import os
import logging
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def run_disease_inference(self, job_id: str, image_path: str):
    """
    Async disease inference via Celery.
    Updates DiseasePrediction record with results.
    """
    from ai.models import DiseasePrediction, PredictionLog

    try:
        from ml_factory.disease.inference import load_disease_model, predict_from_bytes

        models_dir = os.path.join(settings.BASE_DIR, "ai", "models")
        assets = load_disease_model(models_dir)

        with open(image_path, "rb") as f:
            image_bytes = f.read()

        result = predict_from_bytes(image_bytes, assets)

        if result.get("status") == "error":
            DiseasePrediction.objects.filter(job_id=job_id).update(
                status="failed",
                result_json=result,
            )
            return

        # Add OpenRouter advisory
        if result.get("disease") and result["disease"] != "Uncertain":
            try:
                import requests as http_requests
                api_key = os.getenv("OPENROUTER_API_KEY", "")
                if api_key:
                    prompt = (
                        f"A farmer's crop has {result['disease']} with "
                        f"{result.get('confidence_pct', result.get('confidence', 0)):.0f}% confidence. "
                        f"Severity: {result.get('severity', 'unknown')}. "
                        "Write 2 sentences of simple treatment advice for an Indian farmer. "
                        "Include one organic remedy and one chemical option."
                    )
                    resp = http_requests.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}",
                                "Content-Type": "application/json"},
                        json={"model": os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo"),
                              "messages": [{"role": "user", "content": prompt}],
                              "max_tokens": 150, "temperature": 0.7},
                        timeout=10,
                    )
                    if resp.status_code == 200:
                        result["farmer_advisory"] = resp.json()["choices"][0]["message"]["content"].strip()
            except Exception as e:
                logger.warning(f"[DiseaseTask] OpenRouter failed: {e}")

        DiseasePrediction.objects.filter(job_id=job_id).update(
            disease=result.get("disease", "Unknown"),
            confidence=result.get("confidence", 0),
            severity=result.get("severity", "Unknown"),
            risk_level=result.get("risk_level", "Unknown"),
            status="completed",
            result_json=result,
        )

        # Telemetry
        PredictionLog.objects.create(
            domain="disease",
            model_version=result.get("model_version", ""),
            input_hash=result.get("input_hash", ""),
            inference_ms=result.get("inference_ms", 0),
            confidence_score=result.get("confidence"),
        )

        logger.info(f"[DiseaseTask] Job {job_id} completed: {result.get('disease')}")

    except Exception as e:
        logger.error(f"[DiseaseTask] Job {job_id} failed: {e}", exc_info=True)
        DiseasePrediction.objects.filter(job_id=job_id).update(
            status="failed",
            result_json={"error": str(e)},
        )
        raise self.retry(exc=e)
