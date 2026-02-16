from django.utils import timezone
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
    EventRSVP,
    Announcement,
    AnnouncementRead,
    Homework,
    ActivityPhoto,
    Invitation,
)
from .roles import Roles as UserRoles

from .permissions import is_director, is_maestro_itinerante, is_maestro_titular


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ["id", "name", "slug", "subdomain", "logo_url"]


class SchoolCreateSerializer(serializers.ModelSerializer):
    director_email = serializers.EmailField(write_only=True, required=False)
    director_password = serializers.CharField(write_only=True, required=False)
    director_first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    director_last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = School
        fields = [
            "id",
            "name",
            "slug",
            "subdomain",
            "logo_url",
            "director_email",
            "director_password",
            "director_first_name",
            "director_last_name",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        name = (attrs.get("name") or "").strip()
        slug = (attrs.get("slug") or "").strip()
        subdomain = (attrs.get("subdomain") or "").strip()
        if not name:
            raise serializers.ValidationError("Name is required")
        if not slug:
            raise serializers.ValidationError("Slug is required")
        if not subdomain:
            raise serializers.ValidationError("Subdomain is required")
        if School.objects.filter(slug=slug).exists():
            raise serializers.ValidationError("Slug already exists")
        if School.objects.filter(subdomain=subdomain).exists():
            raise serializers.ValidationError("Subdomain already exists")
        return attrs


class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = ["id", "name", "start_date", "end_date", "is_current"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "username",
            "password",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        email = attrs.get("email")
        if school_id and email:
            if User.objects.filter(school_id=school_id, email=email).exists():
                raise serializers.ValidationError("Email already exists for this school")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        username = validated_data.pop("username", "") or validated_data.get("email", "")
        user = User(**validated_data, username=username)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user


class UserRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role", "is_active"]


class UserDetailSerializer(serializers.ModelSerializer):
    calendar_subscription_url = serializers.SerializerMethodField()
    school = SchoolSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "school",
            "preferred_language",
            "ics_token",
            "calendar_subscription_url",
        ]
        read_only_fields = ["ics_token", "calendar_subscription_url"]

    def get_calendar_subscription_url(self, user):
        request = self.context.get("request")
        if not request:
            return ""
        base = request.build_absolute_uri("/api/v1/events/ics/")
        return f"{base}?token={user.ics_token}&school_id={user.school_id}"


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "preferred_language"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "grade_level", "enrollment_code"]


class StudentCreateSerializer(serializers.ModelSerializer):
    group_id = serializers.IntegerField(required=False, write_only=True)
    allow_multiple_groups = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "last_name",
            "grade_level",
            "enrollment_code",
            "group_id",
            "allow_multiple_groups",
        ]
        read_only_fields = ["id"]


class StudentGroupUpdateSerializer(serializers.Serializer):
    group_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )
    replace_existing = serializers.BooleanField(default=True)
    allow_multiple_groups = serializers.BooleanField(default=False)


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
        fields = ["id", "user", "complaint", "role_in_thread", "added_by", "added_at"]
        read_only_fields = ["complaint", "added_by", "added_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        user = attrs.get("user")
        role_in_thread = attrs.get("role_in_thread")

        allowed_roles = set(ComplaintParticipant.ThreadRole.values)

        if role_in_thread not in allowed_roles:
            raise serializers.ValidationError("Invalid role for participant")

        if school_id is not None and user.school_id != school_id:
            raise serializers.ValidationError("User mismatch for school")

        return attrs


class ComplaintSerializer(serializers.ModelSerializer):
    messages = ComplaintMessageSerializer(many=True, read_only=True)
    participants = ComplaintParticipantSerializer(many=True, read_only=True)

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
            "participants",
        ]
        read_only_fields = ["created_by", "status"]

    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)
        user = getattr(request, "user", None)
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
            if about_student:
                belongs = GroupMembership.objects.filter(
                    group=group, student=about_student
                ).exists()
                if not belongs:
                    raise serializers.ValidationError(
                        "Student is not a member of this group"
                    )
            # Ensure target teacher is assigned to the group (homeroom or specialist)
            if (
                group.homeroom_teacher_id != target_teacher.id
                and not SpecialistAssignment.objects.filter(
                    group=group, teacher=target_teacher
                ).exists()
            ):
                raise serializers.ValidationError(
                    "Target teacher is not assigned to this group"
                )

        if user and group:
            # Parents can only create complaints for groups where they have children.
            if user.role == UserRoles.PADRE:
                student_ids = ParentStudent.objects.filter(parent=user).values_list(
                    "student_id", flat=True
                )
                if not GroupMembership.objects.filter(
                    group=group, student_id__in=student_ids
                ).exists():
                    raise serializers.ValidationError(
                        "Parent has no students in this group"
                    )
            # Vocales can only create complaints for their assigned group.
            if user.role == UserRoles.VOCAL:
                if not VocalAssignment.objects.filter(
                    group=group, parent=user, active=True
                ).exists():
                    raise serializers.ValidationError(
                        "Vocal is not assigned to this group"
                    )
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
    computed_status = serializers.CharField(read_only=True)

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
            "computed_status",
            "group_ids",
            "audiences",
            "attachments",
            "photos",
        ]
        read_only_fields = ["created_by", "status", "computed_status"]

    def get_attachments(self, obj):
        return EventAttachmentSerializer(obj.attachments.all(), many=True).data

    def get_photos(self, obj):
        return EventPhotoSerializer(obj.photos.all(), many=True).data


class EventRSVPStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=EventRSVP.Status.choices, allow_null=True, required=False
    )

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
            "requires_ack",
            "ack_deadline",
            "locked",
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


class AnnouncementReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRead
        fields = ["id", "announcement", "user", "read_at"]
        read_only_fields = ["user", "read_at"]


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = [
            "id",
            "token",
            "role",
            "group",
            "expires_at",
            "max_uses",
            "uses_count",
            "created_by",
            "revoked_at",
            "metadata",
            "created_at",
            "is_active",
        ]
        read_only_fields = ["token", "uses_count", "created_by", "revoked_at", "created_at", "is_active"]

    def validate(self, attrs):
        group = attrs.get("group")
        role = attrs.get("role")
        request = self.context.get("request")
        school_id = getattr(request, "school_id", None)

        if group is not None and school_id is not None and group.school_id != school_id:
            raise serializers.ValidationError({"group": "Group mismatch for school"})

        if role in {User.Roles.PADRE, User.Roles.VOCAL, User.Roles.MAESTRO_TITULAR, User.Roles.MAESTRO_ITINERANTE} and group is None:
            raise serializers.ValidationError({"group": "Group required for selected role"})

        expires_at = attrs.get("expires_at")
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError({"expires_at": "Must be in the future"})

        max_uses = attrs.get("max_uses", 1)
        if max_uses < 1:
            raise serializers.ValidationError({"max_uses": "Must be >= 1"})

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
