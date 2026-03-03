from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class AiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai'

    def ready(self):
        """Load ALL ML models at Django startup, then warm-up crop models."""
        import sys
        
        # Prevent segfaults during migrations/management commands AND Windows runserver
        logger.info("[AiConfig] Eager ML model loading disabled to prevent startup crashes. Models will load lazily.")
        return

