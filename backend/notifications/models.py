from django.db import models
from core.models import School, User

class DeviceToken(models.Model):
    class Platform(models.TextChoices):
        ANDROID = "android", "Android"
        IOS = "ios", "iOS"
        WEB = "web", "Web"

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="device_tokens")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="device_tokens")
    token = models.CharField(max_length=255, unique=True, db_index=True)  # Expo push token: ExponentPushToken[...]
    platform = models.CharField(max_length=16, choices=Platform.choices)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# backend/notifications/models.py (añade)
class ExpoTicket(models.Model):
    ticket_id = models.CharField(max_length=128, unique=True)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)


class FailedExpoTicket(models.Model):
    """Record of Expo tickets that resulted in an error."""

    ticket_id = models.CharField(max_length=128)
    token = models.CharField(max_length=255)
    error = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

# backend/notifications/models.py (añade al final)
class NotificationPreference(models.Model):
    class Kind(models.TextChoices):
        EVENT = "event", "Eventos"
        SURVEY = "survey", "Encuestas"
        COMPLAINT = "complaint", "Quejas"
        COMPLAINT_MESSAGE = "complaint_message", "Mensajes de queja"
        PUSH = "push", "Push"
        EMAIL = "email", "Email"

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="notif_prefs")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notif_prefs")
    kind = models.CharField(max_length=32, choices=Kind.choices)
    enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ("school", "user", "kind")
