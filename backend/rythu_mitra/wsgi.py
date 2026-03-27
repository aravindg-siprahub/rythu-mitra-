"""
WSGI config for Rythu Mitra project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rythu_mitra.settings.base')
application = get_wsgi_application()
