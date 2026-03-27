import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================
# SECURITY
# ============================================
SECRET_KEY = os.getenv("SECRET_KEY", "prod-secret-key-change-this")
DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = [
    "localhost", 
    "127.0.0.1", 
    "backend", 
    "rythumitra.com", 
    "www.rythumitra.com",
    os.getenv("EC2_PUBLIC_IP", ""),
    ".onrender.com"  # Allow all render subdomains
]

# ============================================
# APPS & MIDDLEWARE
# ============================================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "authapp",
    "farmers",
    "market",
    "workers",
    "transport",
    "ai",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", # Must be top
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "project.urls"
WSGI_APPLICATION = "project.wsgi.application"

# ============================================
# DATABASE & CACHE
# ============================================
import dj_database_url

# ... (rest of imports)

# ============================================
# DATABASE & CACHE
# ============================================
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', 'postgres://postgres:postgres@db:5432/rythu_mitra'),
        conn_max_age=600
    )
}

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
CELERY_BROKER_URL = f"{REDIS_URL}/0"
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"{REDIS_URL}/1",
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"}
    }
}

# ============================================
# CORS (Allow Frontend Access)
# ============================================
CORS_ALLOW_ALL_ORIGINS = DEBUG # Only allow all in debug

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:80",
    "https://rythumitra.com",
    "https://www.rythumitra.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://rythumitra.com",
    "https://www.rythumitra.com",
]

# ============================================
# STATIC & MEDIA
# ============================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ============================================
# DRF
# ============================================
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "EXCEPTION_HANDLER": "project.utils.custom_exception_handler",
}

# ============================================
# I18N
# ============================================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
