import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edulinker.settings")
app = Celery("edulinker")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = getattr(app.conf, "beat_schedule", {})
app.conf.beat_schedule.update(
    {
        "cleanup-invalid-tokens-daily": {
            "task": "notifications.tasks.cleanup_invalid_tokens",
            "schedule": crontab(hour=0, minute=0),
        }
    }
)
