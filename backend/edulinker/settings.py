import logging
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
from pythonjsonlogger import jsonlogger
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("SENTRY_ENVIRONMENT", "development"),
    integrations=[DjangoIntegration()],
    traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.0")),
)

SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
DEBUG = os.getenv('DEBUG', '0') == '1'
ALLOWED_HOSTS = ["*"]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js
    "http://localhost:19006", # Expo web (si aplica)
]
CORS_ALLOW_CREDENTIALS = True

SHARED_APPS = [
    'django_tenants',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'edulinker',
    'core',
]

TENANT_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'surveys',
    'fundraising',
    'analytics',
    'chat',
    'suggestions',
    'notifications',
    'audit',
]

INSTALLED_APPS = list(dict.fromkeys(SHARED_APPS + TENANT_APPS))

TENANT_MODEL = "core.School"
DATABASE_ROUTERS = ("django_tenants.routers.TenantSyncRouter",)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.SchoolMiddleware',
]

ROOT_URLCONF = 'edulinker.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'edulinker.wsgi.application'

# Celery (dev)
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)
CELERY_TASK_ALWAYS_EAGER = os.getenv("CELERY_TASK_ALWAYS_EAGER") == "1"

EVENT_REMINDER_HOURS_AHEAD = int(os.getenv("EVENT_REMINDER_HOURS_AHEAD", "24"))
SURVEY_REMINDER_HOURS_AHEAD = int(os.getenv("SURVEY_REMINDER_HOURS_AHEAD", "24"))
COMPLAINT_ESCALATION_DAYS = int(os.getenv("COMPLAINT_ESCALATION_DAYS", "5"))
HOMEWORK_REMINDER_DAYS_AHEAD = int(os.getenv("HOMEWORK_REMINDER_DAYS_AHEAD", "1"))

from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    "event-reminders-every-hour": {
        "task": "core.tasks.send_event_reminders",
        "schedule": 3600.0,
    },
    "complaints-escalation-daily": {
        "task": "core.tasks.escalate_stale_complaints",
        "schedule": crontab(hour=7, minute=0),
    },
    "surveys-reminder-every-3h": {
        "task": "core.tasks.remind_surveys_to_close",
        "schedule": 10800.0,
    },
    "homework-reminders-daily": {
        "task": "core.tasks.send_homework_reminders",
        "schedule": crontab(hour=7, minute=0),
    },
    "fundraising-weekly-summary": {
        "task": "fundraising.tasks.weekly_fundraising_summary",
        "schedule": crontab(day_of_week="monday", hour=7, minute=0),
    },
}


if os.getenv('USE_SQLITE') == '1':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django_tenants.postgresql_backend',
            'NAME': os.getenv('POSTGRES_DB', 'edulinker'),
            'USER': os.getenv('POSTGRES_USER', 'edulinker'),
            'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'edulinker'),
            'HOST': os.getenv('POSTGRES_HOST', 'db'),
            'PORT': os.getenv('POSTGRES_PORT', '5432'),
        }
    }

AUTH_USER_MODEL = 'core.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '1000/day',
        'anon': '100/day',
        'login': '5/min',
        'complaint': '20/day',
    },
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'EduLinker API',
    'DESCRIPTION': 'Documentación de la API de EduLinker',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


class RequestContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        request = getattr(record, "request", None)
        record.request_id = None
        record.school_id = None
        record.user_id = None
        if request:
            headers = getattr(request, "headers", {})
            record.request_id = (
                headers.get("X-Request-ID")
                or getattr(getattr(request, "META", {}), "get", lambda k: None)("HTTP_X_REQUEST_ID")
            )
            record.school_id = getattr(request, "school_id", None)
            user = getattr(request, "user", None)
            record.user_id = getattr(user, "id", None)
        return True


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "request_context": {
            "()": "edulinker.settings.RequestContextFilter",
        }
    },
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(levelname)s %(name)s %(message)s %(request_id)s %(school_id)s %(user_id)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "filters": ["request_context"],
            "formatter": "json",
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

