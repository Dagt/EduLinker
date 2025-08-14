from django.db import models
from django.utils import timezone
from core.models import School, Group, User

class Suggestion(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_REVIEW = "IN_REVIEW", "In Review"
        RESOLVED = "RESOLVED", "Resolved"
        CLOSED = "CLOSED", "Closed"

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="suggestions")
    group = models.ForeignKey(Group, null=True, blank=True, on_delete=models.CASCADE, related_name="suggestions")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="suggestions_created")
    target_teacher = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="suggestions_targeted"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SuggestionMessage(models.Model):
    suggestion = models.ForeignKey(Suggestion, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="suggestion_messages")
    message = models.TextField()
    attachments = models.JSONField(blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
