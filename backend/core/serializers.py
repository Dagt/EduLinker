from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import (
    School,
    SchoolYear,
    User,
    Student,
    ParentStudent,
    Group,
    GroupMembership,
    SpecialistAssignment,
    VocalAssignment,
    Complaint,
    ComplaintMessage,
    ComplaintParticipant,
    Event,
    EventGroupAudience,
    EventAttachment,
    EventPhoto,
    Announcement,
    Homework,
    ActivityPhoto,
)

from .permissions import is_director, is_maestro_itinerante, is_maestro_titular


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ["id", "name", "slug", "subdomain", "logo_url"]


class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = ["id", "name", "start_date", "end_date", "is_current"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role"]


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "grade_level", "enrollment_code"]


class ParentStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentStudent
        fields = ["id", "parent", "student", "relationship"]


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "grade_level", "school_year", "homeroom_teacher"]


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating groups. School and year will be provided by the view."""

    class Meta:
        model = Group
        fields = ["id", "name", "grade_level"]
        read_only_fields = ["id"]


class AssignHomeroomTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["homeroom_teacher"]

    def validate_homeroom_teacher(self, teacher):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        if teacher.school_id != school_id:
            raise serializers.ValidationError("Teacher mismatch for school")
        if not is_maestro_titular(teacher):
            raise serializers.ValidationError("Teacher must be maestro titular")
        return teacher


class GroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = ["id", "group", "student"]


class SpecialistAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialistAssignment
        fields = ["id", "group", "teacher", "subject"]
        read_only_fields = ["id", "group"]


class VocalAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocalAssignment
        fields = [
            "id",
            "group",
            "parent",
            "assigned_by",
            "start_at",
            "end_at",
            "active",
        ]
        read_only_fields = ["id", "assigned_by", "start_at", "end_at", "active"]

    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        group = attrs.get("group")
        parent = attrs.get("parent")
        if group.school_id != school_id:
            raise serializers.ValidationError("Group mismatch for school")
        if parent.school_id != school_id:
            raise serializers.ValidationError("Parent mismatch for school")
        return attrs


class ComplaintMessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = ComplaintMessage
        fields = ["id", "author", "message", "attachments", "created_at"]


class ComplaintParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintParticipant
        fields = ["id", "user", "complaint"]
        read_only_fields = ["complaint"]

    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        user = attrs.get("user")
        if school_id is not None and user.school_id != school_id:
            raise serializers.ValidationError("User mismatch for school")
        return attrs


class ComplaintSerializer(serializers.ModelSerializer):
    messages = ComplaintMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "group",
            "created_by",
            "target_teacher",
            "about_student",
            "status",
            "description",
            "created_at",
            "updated_at",
            "messages",
        ]
        read_only_fields = ["created_by", "status"]

    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        group = attrs.get("group")
        target_teacher = attrs.get("target_teacher")
        about_student = attrs.get("about_student")

        if school_id is not None:
            if group.school_id != school_id:
                raise serializers.ValidationError("Group mismatch for school")
            if target_teacher.school_id != school_id:
                raise serializers.ValidationError("Teacher mismatch for school")
            if about_student and about_student.school_id != school_id:
                raise serializers.ValidationError("Student mismatch for school")
        return attrs


class ComplaintStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ["status"]


class EventGroupAudienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventGroupAudience
        fields = ["id", "group"]


class EventSerializer(serializers.ModelSerializer):
    group_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    audiences = EventGroupAudienceSerializer(
        source="group_audiences", many=True, read_only=True
    )
    attachments = serializers.SerializerMethodField()
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "scope",
            "title",
            "description",
            "location",
            "start_at",
            "end_at",
            "created_by",
            "status",
            "group_ids",
            "audiences",
            "attachments",
            "photos",
        ]
        read_only_fields = ["created_by", "status"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def create(self, validated_data):
        groups = validated_data.pop("groups", [])
        event = Event.objects.create(**validated_data)
        for group in groups:
            EventGroupAudience.objects.create(event=event, group=group)
        return event

    def validate(self, attrs):
        scope = attrs.get("scope")
        group_ids = attrs.pop("group_ids", [])
        groups = list(Group.objects.filter(id__in=group_ids))
        attrs["groups"] = groups

        if scope == Event.Scope.GROUP:
            if not groups:
                raise serializers.ValidationError(
                    "group_ids required for group scope"
                )
            request = self.context.get("request")
            user = getattr(request, "user", None)
            school_id = getattr(request, "school_id", None)
            if school_id is not None:
                if {g.id for g in groups} != set(group_ids) or any(
                    g.school_id != school_id for g in groups
                ):
                    raise PermissionDenied("Group mismatch for school")
            if user and not is_director(user):
                if is_maestro_titular(user):
                    for group in groups:
                        if group.homeroom_teacher_id != user.id:
                            raise PermissionDenied(
                                "Cannot create event for this group"
                            )
                elif is_maestro_itinerante(user):
                    allowed = set(
                        SpecialistAssignment.objects.filter(teacher=user)
                        .values_list("group_id", flat=True)
                    )
                    for group in groups:
                        if group.id not in allowed:
                            raise PermissionDenied(
                                "Cannot create event for this group"
                            )
                else:
                    raise PermissionDenied("Not allowed to create group events")

        if scope == Event.Scope.GLOBAL and group_ids:
            raise serializers.ValidationError(
                "group_ids not allowed for global scope"
            )
        return attrs

    def get_attachments(self, obj):
        return EventAttachmentSerializer(obj.attachments.all(), many=True).data

    def get_photos(self, obj):
        return EventPhotoSerializer(obj.photos.all(), many=True).data


class EventAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttachment
        fields = ["id", "file_url", "filename", "mime"]


class EventPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPhoto
        fields = ["id", "photo_url", "caption", "created_at"]
        read_only_fields = ["created_at"]


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "scope",
            "group",
            "teacher",
            "title",
            "message",
            "attachments",
            "created_at",
        ]
        read_only_fields = ["teacher", "created_at"]

    def validate(self, attrs):
        scope = attrs.get("scope", Announcement.Scope.GRUPO)
        group = attrs.get("group")
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        if group is not None:
            if school_id is not None and group.school_id != school_id:
                raise serializers.ValidationError({"group": "Group mismatch for school"})
        if scope == Announcement.Scope.GRUPO and group is None:
            raise serializers.ValidationError({"group": "Group required for group scope"})
        if scope == Announcement.Scope.GLOBAL:
            attrs["group"] = None
        return attrs


class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = [
            "id",
            "group",
            "subject",
            "teacher",
            "title",
            "description",
            "due_date",
            "attachments",
            "created_at",
        ]
        read_only_fields = ["teacher", "created_at"]

    def validate_group(self, value):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        if school_id is not None and value.school_id != school_id:
            raise serializers.ValidationError("Group mismatch for school")
        return value


class ActivityPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityPhoto
        fields = [
            "id",
            "group",
            "homework",
            "photo_url",
            "caption",
            "uploaded_by",
            "created_at",
        ]
        read_only_fields = ["uploaded_by", "created_at"]
