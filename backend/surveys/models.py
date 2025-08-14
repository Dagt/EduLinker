from django.db import models
from django.utils import timezone
from core.models import School, Group, User

class Survey(models.Model):
    class Scope(models.TextChoices):
        GROUP = "GROUP", "Group"
        SCHOOL = "SCHOOL", "School"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        CLOSED = "CLOSED", "Closed"

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="surveys")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="surveys_created")
    scope = models.CharField(max_length=10, choices=Scope.choices)
    group = models.ForeignKey(Group, null=True, blank=True, on_delete=models.CASCADE, related_name="surveys")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    options = models.JSONField()  # lista de opciones (strings)
    is_anonymous = models.BooleanField(default=False)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["school", "status"]),
        ]

    def is_active(self):
        now = timezone.now()
        return self.status == self.Status.ACTIVE and self.start_at <= now <= self.end_at

class SurveyVote(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="votes")
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="survey_votes")
    option_index = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("survey", "voter")]
