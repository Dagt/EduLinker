from django.contrib import admin
from .models import (
    School, SchoolYear, User, Student, Group, GroupMembership,
    SpecialistAssignment, VocalAssignment,
    Complaint, ComplaintMessage,
    Event, EventGroupAudience, EventAttachment, EventPhoto,
    Announcement, Homework, ActivityPhoto
)

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("id","name","slug","subdomain","active")
    search_fields = ("name","slug","subdomain")
    list_filter = ("active",)

@admin.register(SchoolYear)
class SchoolYearAdmin(admin.ModelAdmin):
    list_display = ("id","school","name","start_date","end_date","is_current")
    list_filter = ("school","is_current")
    search_fields = ("name",)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id","email","first_name","last_name","role","school","is_active","is_staff")
    list_filter = ("school","role","is_active","is_staff")
    search_fields = ("email","first_name","last_name")

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("id","school","school_year","name","grade_level","homeroom_teacher")
    list_filter = ("school","school_year","grade_level")
    search_fields = ("name",)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id","school","first_name","last_name","enrollment_code")
    list_filter = ("school",)
    search_fields = ("first_name","last_name","enrollment_code")

@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ("id","school","group","student")
    list_filter = ("school","group")

@admin.register(SpecialistAssignment)
class SpecialistAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id","school","group","teacher","subject")
    list_filter = ("school","subject","group")

@admin.register(VocalAssignment)
class VocalAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id","group","parent","active","start_at","end_at")
    list_filter = ("active","group")

class ComplaintMessageInline(admin.TabularInline):
    model = ComplaintMessage
    extra = 0

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ("id","school","group","created_by","target_teacher","status","created_at")
    list_filter = ("school","status","group")
    search_fields = ("description",)
    inlines = [ComplaintMessageInline]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id","school","school_year","scope","title","start_at","end_at","status","created_by")
    list_filter = ("school","scope","status","school_year")
    search_fields = ("title","description")

@admin.register(EventGroupAudience)
class EventGroupAudienceAdmin(admin.ModelAdmin):
    list_display = ("id","event","group")

@admin.register(EventAttachment)
class EventAttachmentAdmin(admin.ModelAdmin):
    list_display = ("id","event","file_url","filename","mime")

@admin.register(EventPhoto)
class EventPhotoAdmin(admin.ModelAdmin):
    list_display = ("id","event","photo_url","caption","created_at")

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "school",
        "scope",
        "group",
        "teacher",
        "title",
        "created_at",
    )
    list_filter = ("school", "scope", "group")
    search_fields = ("title", "message")

@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ("id","school","group","subject","teacher","title","due_date","created_at")
    list_filter = ("school","group","subject")
    search_fields = ("title","description")

@admin.register(ActivityPhoto)
class ActivityPhotoAdmin(admin.ModelAdmin):
    list_display = ("id","school","group","uploaded_by","caption","created_at")
    list_filter = ("school","group")
