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
    "daphne", # Must be first
    "channels",
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
    "ml_factory",
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
    "farmers.middleware.AuditLogMiddleware",
]

ROOT_URLCONF = "project.urls"

# DRF Rate Limiting
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "EXCEPTION_HANDLER": "project.utils.custom_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle"
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day",
        "burst": "60/min"
    }
}

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "project.wsgi.application"
ASGI_APPLICATION = "project.asgi.application"

# ============================================
# DATABASE & CACHE
# ============================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'postgres'),
        'USER': os.getenv('DB_USER', 'postgres.imnuxsdpxwiafpnuhedt'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'aws-1-ap-northeast-1.pooler.supabase.com'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
            'connect_timeout': 10,
        },
        'CONN_MAX_AGE': 60,
    }
}

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

if REDIS_URL == "local":
    CELERY_BROKER_URL = "memory://"
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }
else:
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
    "http://localhost:3001",
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
