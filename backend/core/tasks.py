from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from core.models import Event

@shared_task
def send_event_reminders():
    now = timezone.now()
    soon = now + timedelta(hours=24)
    events = Event.objects.filter(status=Event.Status.ACTIVE, start_at__range=(now, soon))
    # TODO: resolver audiencia (can_view_event por rol) y enviar email/push
    return events.count()
