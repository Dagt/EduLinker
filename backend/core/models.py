from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.utils import timezone

from .roles import Roles as UserRoles


class School(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    logo_url = models.URLField(blank=True)
    subdomain = models.CharField(max_length=50, unique=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class SchoolYear(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="years"
    )
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["school", "name"], name="unique_school_year_name"
            ),
            models.UniqueConstraint(
                fields=["school"],
                condition=Q(is_current=True),
                name="unique_current_year_per_school",
            ),
        ]

    def __str__(self):
        return f"{self.school} {self.name}"


class User(AbstractUser):
    # Re-export roles for backwards compatibility
    Roles = UserRoles

    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="users"
    )
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=UserRoles.choices)
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["school", "email"], name="unique_email_per_school"
            )
        ]

    def __str__(self):
        return f"{self.username} ({self.school})"


class Student(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="students"
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    grade_level = models.PositiveSmallIntegerField()
    enrollment_code = models.CharField(max_length=50)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["school", "enrollment_code"],
                name="unique_enrollment_code_per_school",
            )
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ParentStudent(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="parent_students"
    )
    parent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="children_relations"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="parent_relations"
    )
    relationship = models.CharField(max_length=20)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "student"], name="unique_parent_student"
            )
        ]


class Group(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="groups"
    )
    school_year = models.ForeignKey(
        SchoolYear, on_delete=models.CASCADE, related_name="groups"
    )
    name = models.CharField(max_length=50)
    grade_level = models.PositiveSmallIntegerField()
    homeroom_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="homeroom_groups",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["school", "school_year", "name"],
                name="unique_group_per_year",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.school_year}"


class GroupMembership(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="group_memberships"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="memberships"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="memberships"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["group", "student"], name="unique_group_student"
            )
        ]


class SpecialistAssignment(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="specialist_assignments"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="specialist_assignments"
    )
    teacher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="specialist_assignments"
    )
    subject = models.CharField(max_length=50)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["group", "teacher", "subject"],
                name="unique_specialist_assignment",
            )
        ]


class VocalAssignment(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="vocal_assignments"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="vocal_assignments"
    )
    parent = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="vocal_assignments"
    )
    assigned_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="assigned_vocal_assignments"
    )
    start_at = models.DateTimeField(default=timezone.now)
    end_at = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["group", "parent"],
                condition=Q(active=True),
                name="unique_active_vocal_per_group_parent",
            )
        ]


class Complaint(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_REVIEW = "IN_REVIEW", "In Review"
        ESCALATED = "ESCALATED", "Escalated"
        RESOLVED = "RESOLVED", "Resolved"
        CLOSED = "CLOSED", "Closed"

    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="complaints"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="complaints"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="complaints"
    )
    target_teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="complaints_targeted",
    )
    about_student = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["school", "status"])]


class ComplaintParticipant(models.Model):
    complaint = models.ForeignKey(
        Complaint, on_delete=models.CASCADE, related_name="participants"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="complaint_participations"
    )
    role_in_thread = models.CharField(max_length=20, choices=UserRoles.choices, null=True)
    added_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="complaint_participants_added",
        null=True,
    )
    added_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["complaint", "user"], name="unique_complaint_participant"
            )
        ]


class ComplaintMessage(models.Model):
    complaint = models.ForeignKey(
        Complaint, on_delete=models.CASCADE, related_name="messages"
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="complaint_messages"
    )
    message = models.TextField()
    attachments = models.JSONField(blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)


class Event(models.Model):
    class Scope(models.TextChoices):
        GLOBAL = "GLOBAL", "Global"
        GROUP = "GROUP", "Group"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CANCELLED = "CANCELLED", "Cancelled"

    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="events"
    )
    school_year = models.ForeignKey(
        SchoolYear, on_delete=models.CASCADE, related_name="events"
    )
    scope = models.CharField(max_length=10, choices=Scope.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="events_created"
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )

    class Meta:
        indexes = [models.Index(fields=["school", "start_at"])]


class EventGroupAudience(models.Model):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="group_audiences"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="event_audiences"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "group"], name="unique_event_group_audience"
            )
        ]


class EventAttachment(models.Model):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="attachments"
    )
    file_url = models.URLField()
    filename = models.CharField(max_length=255)
    mime = models.CharField(max_length=100)


class EventPhoto(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="photos")
    photo_url = models.URLField()
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Announcement(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="announcements"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="announcements"
    )
    teacher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="announcements"
    )
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    attachments = models.JSONField(blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)


class Homework(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="homeworks"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="homeworks"
    )
    subject = models.CharField(max_length=50)
    teacher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="homeworks"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    attachments = models.JSONField(blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)


class ActivityPhoto(models.Model):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="activity_photos"
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="activity_photos",
        null=True,
        blank=True,
    )
    homework = models.ForeignKey(
        Homework,
        on_delete=models.CASCADE,
        related_name="activity_photos",
        null=True,
        blank=True,
    )
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="activity_photos"
    )
    photo_url = models.URLField()
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

