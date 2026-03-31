"""
Rythu Mitra — Base Django Settings
All configuration loaded from .env via python-dotenv
"""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load .env from the backend root directory explicitly
load_dotenv(dotenv_path=BASE_DIR / '.env', override=True)

def env(key, default=None):
    return os.environ.get(key, default)

def env_list(key, default=''):
    raw = os.environ.get(key, default)
    return [item.strip() for item in raw.split(',') if item.strip()]

def env_bool(key, default=False):
    val = os.environ.get(key, str(default)).lower()
    return val in ('1', 'true', 'yes', 'on')

# ─── SECURITY ─────────────────────────────────────────────────────────────────
SECRET_KEY = env('SECRET_KEY', 'django-insecure-dev-key-change-in-prod-!@#')
DEBUG = env_bool('DEBUG', True)
ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', '*')

# ─── APPLICATIONS ─────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django built-ins
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    'django_celery_results',
    # Our apps
    'apps.core.apps.CoreConfig',
    'apps.auth_app',
    'apps.crop',
    'apps.disease',
    'apps.market',
    'apps.weather',
    'apps.workers',
    'apps.transport',
    'apps.i18n_app',
    'apps.predictions',
    'apps.farmers',
    'apps.workforce',
    'apps.work',
]

# ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'rythu_mitra.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'rythu_mitra.wsgi.application'

# ─── DATABASE ─────────────────────────────────────────────────────────────────
# SQLite only used by django-ratelimit internals; all app data is in Supabase.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ─── CACHE (for django-ratelimit and celery results) ──────────────────────────
_REDIS_BASE = env('REDIS_URL', env('CELERY_BROKER_URL', 'redis://localhost:6379'))
# Strip trailing /0 db index from REDIS_URL so we can append /1 for cache
_REDIS_BASE_STRIPPED = _REDIS_BASE.rsplit('/', 1)[0] if _REDIS_BASE.endswith('/0') else _REDIS_BASE

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'{_REDIS_BASE_STRIPPED}/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# ─── DRF ──────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.core.permissions.SupabaseJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'EXCEPTION_HANDLER': 'apps.core.response.custom_exception_handler',
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000',
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ─── STATIC FILES ─────────────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ─── INTERNATIONALIZATION ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── FILE UPLOAD ──────────────────────────────────────────────────────────────
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024    # 5 MB

# ─── LOGGING ──────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'apps.core': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ─── SUPABASE ─────────────────────────────────────────────────────────────────
SUPABASE_URL = env('SUPABASE_URL', '')
SUPABASE_ANON_KEY = env('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_KEY = env('SUPABASE_SERVICE_KEY', '')
SUPABASE_JWT_SECRET = env('SUPABASE_JWT_SECRET', '')

# ─── OPENROUTER ───────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = env('OPENROUTER_API_KEY', '')
GROQ_API_KEY = env('GROQ_API_KEY', '')
OPENROUTER_BASE_URL = env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

# ─── OPENWEATHER ──────────────────────────────────────────────────────────────
OPENWEATHER_API_KEY = env('OPENWEATHER_API_KEY', '')

# ─── CELERY ───────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = env('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 300
