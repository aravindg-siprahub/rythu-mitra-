"""
ASGI config for Rythu Mitra project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rythu_mitra.settings.base')
application = get_asgi_application()
