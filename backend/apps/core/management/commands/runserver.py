"""
Custom runserver command for Rythu Mitra.

Automatically starts Redis and Celery worker BEFORE Django server starts in Development
so that `python manage.py runserver` starts everything in one command.

Usage:
    python manage.py runserver           → starts on 127.0.0.1:8000
    python manage.py runserver 0.0.0.0:8000

NOTE: Inherits from staticfiles runserver (not core) because
      django.contrib.staticfiles overrides runserver and comes before
      apps.core in INSTALLED_APPS — so we must extend staticfiles' version.
"""

import os
from django.conf import settings
from django.contrib.staticfiles.management.commands.runserver import (
    Command as BaseRunserverCommand,
)

class Command(BaseRunserverCommand):
    help = (
        "Starts Redis + Celery worker + Django development server "
        "in a single command when DEBUG is True."
    )

    def handle(self, *args, **options):
        # Only start Redis/Celery on the MAIN process (not the reloader child)
        # when DEBUG is True. Production should deploy services independently.
        if settings.DEBUG and os.environ.get("RUN_MAIN") != "true":
            try:
                from apps.core.utils.dev_startup import run_dev_services
                run_dev_services()
            except ImportError as e:
                print(f"⚠️ Could not import development startup utils: {e}")

        # Call the original runserver logic
        super().handle(*args, **options)
