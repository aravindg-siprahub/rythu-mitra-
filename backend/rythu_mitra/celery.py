import os

from celery import Celery


# Use the project's base Django settings for Celery.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rythu_mitra.settings.base")

app = Celery("rythu_mitra")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

