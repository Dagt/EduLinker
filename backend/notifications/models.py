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
