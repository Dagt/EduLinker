from rest_framework import serializers

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
    Event,
    EventGroupAudience,
    EventAttachment,
    EventPhoto,
    Homework,
    ActivityPhoto,
)


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


class GroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = ["id", "group", "student"]


class SpecialistAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialistAssignment
        fields = ["id", "group", "teacher", "subject"]


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


class ComplaintMessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = ComplaintMessage
        fields = ["id", "author", "message", "attachments", "created_at"]


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
    group_ids = serializers.PrimaryKeyRelatedField(
        source="groups",
        queryset=Group.objects.none(),
        many=True,
        write_only=True,
        required=False,
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
        request = self.context.get("request")
        if request:
            self.fields["group_ids"].queryset = Group.objects.filter(
                school_id=request.school_id
            )

    def create(self, validated_data):
        groups = validated_data.pop("groups", [])
        event = Event.objects.create(**validated_data)
        for group in groups:
            EventGroupAudience.objects.create(event=event, group=group)
        return event

    def validate(self, attrs):
        scope = attrs.get("scope")
        groups = attrs.get("groups", [])
        if scope == Event.Scope.GROUP and not groups:
            raise serializers.ValidationError("group_ids required for group scope")
        if scope == Event.Scope.GLOBAL and groups:
            raise serializers.ValidationError("group_ids not allowed for global scope")
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
