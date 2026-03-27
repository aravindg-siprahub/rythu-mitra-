import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

app = Celery("rythu_mitra")

# Load config from Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

# ============================================
# CELERY BEAT SCHEDULE (PERIODIC TASKS)
# ============================================
app.conf.beat_schedule = {
    # Fetch weather data every 6 hours
    "fetch-weather-data": {
        "task": "ai.tasks.fetch_weather_data",
        "schedule": crontab(minute=0, hour="*/6"),
    },
    # Update market prices daily at 6 AM
    "update-market-prices": {
        "task": "ai.tasks.update_market_prices",
        "schedule": crontab(minute=0, hour=6),
    },
    # Retrain models weekly on Sunday at 2 AM
    "retrain-models": {
        "task": "ai.tasks.retrain_models",
        "schedule": crontab(minute=0, hour=2, day_of_week=0),
    },
    # Clean old predictions monthly
    "cleanup-old-predictions": {
        "task": "ai.tasks.cleanup_old_predictions",
        "schedule": crontab(minute=0, hour=3, day_of_month=1),
    },
}

# ============================================
# CELERY TASK ROUTES
# ============================================
app.conf.task_routes = {
    "ai.tasks.predict_crop_recommendation": {"queue": "high_priority"},
    "ai.tasks.detect_disease": {"queue": "high_priority"},
    "ai.tasks.maximize_profit": {"queue": "high_priority"},
    "ai.tasks.forecast_weather": {"queue": "medium_priority"},
    "ai.tasks.predict_market_prices": {"queue": "medium_priority"},
    "ai.tasks.fetch_weather_data": {"queue": "low_priority"},
    "ai.tasks.retrain_models": {"queue": "low_priority"},
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
