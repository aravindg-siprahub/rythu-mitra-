# Core app
default_app_config = "apps.core.apps.CoreConfig"

# Export Celery application for explicit resolution
from rythu_mitra.celery import app as celery_app

__all__ = ("celery_app",)
