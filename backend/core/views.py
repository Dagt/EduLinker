import io
import uuid

from django.core.management import call_command
from django.core.management.base import CommandError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from notifications.tasks import push_to_users

from audit.models import AuditLog
from core.pagination import DefaultPagination
from core.filters import ComplaintFilter, EventFilter, StudentFilter, UserFilter

from .models import (
    Announcement,
    Homework,
    Group,
    Complaint,
    ComplaintMessage,
    Event,
    EventRSVP,
    School,
    SchoolYear,
    SpecialistAssignment,
    GroupMembership,
    ParentStudent,
    VocalAssignment,
    ActivityPhoto,
    Student,
    User,
)
from .permissions import (
    CanAccessComplaint,
    can_post_activity_photo,
    can_view_event,
    user_can_view_event,
    is_admin_tenant,
    is_director,
    is_maestro_itinerante,
    is_maestro_titular,
    is_padre,
    is_vocal,
    IsDirector,
    IsAdminTenant,
)
from .serializers import (
    SchoolSerializer,
    AnnouncementSerializer,
    HomeworkSerializer,
    ComplaintMessageSerializer,
    ComplaintParticipantSerializer,
    ComplaintSerializer,
    ComplaintStatusSerializer,
    EventAttachmentSerializer,
    EventPhotoSerializer,
    EventSerializer,
    EventRSVPStatusSerializer,
    ActivityPhotoSerializer,
    GroupSerializer,
    GroupCreateSerializer,
    AssignHomeroomTeacherSerializer,
    SpecialistAssignmentSerializer,
    VocalAssignmentSerializer,
    UserSerializer,
    UserDetailSerializer,
    UserUpdateSerializer,
    UserCreateSerializer,
    UserRoleUpdateSerializer,
    StudentSerializer,
    StudentCreateSerializer,
    StudentGroupUpdateSerializer,
    ParentStudentSerializer,
)
from .throttles import ComplaintCreateThrottle, EventCreateThrottle
from .utils import get_event_audience_user_ids


def _visible_group_ids(user):
    if is_director(user):
        return Group.objects.filter(school_id=user.school_id).values_list("id", flat=True)
    if is_maestro_titular(user):
        return Group.objects.filter(homeroom_teacher_id=user.id).values_list("id", flat=True)
    if is_maestro_itinerante(user):
        return SpecialistAssignment.objects.filter(teacher_id=user.id).values_list(
            "group_id", flat=True
        )
    if is_vocal(user):
        return VocalAssignment.objects.filter(parent_id=user.id, active=True).values_list(
            "group_id", flat=True
        )
    if is_padre(user):
        student_ids = ParentStudent.objects.filter(parent_id=user.id).values_list(
            "student_id", flat=True
        )
        return GroupMembership.objects.filter(student_id__in=student_ids).values_list(
            "group_id", flat=True
        )
    return Group.objects.none().values_list("id", flat=True)


def _can_manage_group(user, group):
    if user.school_id != group.school_id:
        return False
    if is_director(user):
        return True
    if is_maestro_titular(user) and group.homeroom_teacher_id == user.id:
        return True
    if is_maestro_itinerante(user) and SpecialistAssignment.objects.filter(
        group=group, teacher=user
    ).exists():
        return True
    return False


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return self.request.user


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserDetailSerializer

    def perform_update(self, serializer):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        serializer.save()


class RegenerateICSTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.school_id != request.school_id:
            raise PermissionDenied("Invalid school")
        request.user.ics_token = uuid.uuid4()
        request.user.save(update_fields=["ics_token"])
        serializer = UserDetailSerializer(request.user, context={"request": request})
        return Response(
            {
                "ics_token": serializer.data["ics_token"],
                "calendar_subscription_url": serializer.data["calendar_subscription_url"],
            }
        )


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDirector]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        qs = User.objects.filter(school_id=self.request.school_id)
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs.order_by("last_name", "first_name")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        user = serializer.save(school_id=self.request.school_id)
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="create",
            entity_type="user",
            entity_id=user.id,
            metadata={"role": user.role},
        )


class UserRoleUpdateView(generics.UpdateAPIView):
    serializer_class = UserRoleUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminTenant]

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return User.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        user = self.get_object()
        prev_role = user.role
        prev_active = user.is_active
        serializer.save()
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="role_update",
            entity_type="user",
            entity_id=user.id,
            metadata={
                "from_role": prev_role,
                "to_role": serializer.instance.role,
                "from_active": prev_active,
                "to_active": serializer.instance.is_active,
            },
        )


class UserDeactivateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminTenant]

    def post(self, request, *args, **kwargs):
        if request.user.school_id != request.school_id:
            raise PermissionDenied("Invalid school")
        user = get_object_or_404(User, pk=self.kwargs["pk"], school_id=request.school_id)
        user.is_active = False
        user.save(update_fields=["is_active"])
        AuditLog.objects.create(
            school_id=request.school_id,
            actor=request.user,
            action="deactivate",
            entity_type="user",
            entity_id=user.id,
        )
        return Response({"detail": "User deactivated"}, status=status.HTTP_200_OK)


class UserAnonymizeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminTenant]

    def post(self, request, *args, **kwargs):
        if request.user.school_id != request.school_id:
            raise PermissionDenied("Invalid school")
        user = get_object_or_404(User, pk=self.kwargs["pk"], school_id=request.school_id)
        user.anonymize()
        user.is_active = False
        user.save(update_fields=["is_active"])
        AuditLog.objects.create(
            school_id=request.school_id,
            actor=request.user,
            action="anonymize",
            entity_type="user",
            entity_id=user.id,
        )
        return Response({"detail": "User anonymized"}, status=status.HTTP_200_OK)


class StudentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDirector]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = StudentFilter

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return Student.objects.filter(school_id=self.request.school_id).order_by("last_name")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StudentCreateSerializer
        return StudentSerializer

    def perform_create(self, serializer):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        group_id = serializer.validated_data.pop("group_id", None)
        allow_multiple = serializer.validated_data.pop("allow_multiple_groups", False)
        student = serializer.save(school_id=self.request.school_id)
        if group_id:
            group = get_object_or_404(Group, pk=group_id, school_id=self.request.school_id)
            if group.school_year_id:
                existing = GroupMembership.objects.filter(
                    student=student, group__school_year_id=group.school_year_id
                ).exists()
                if existing and not allow_multiple:
                    raise PermissionDenied("Student already assigned to a group in this school year")
            GroupMembership.objects.create(
                school_id=self.request.school_id, student=student, group=group
            )
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="create",
            entity_type="student",
            entity_id=student.id,
        )


class StudentDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return Student.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        student = serializer.save()
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="update",
            entity_type="student",
            entity_id=student.id,
        )


class StudentGroupUpdateView(generics.UpdateAPIView):
    serializer_class = StudentGroupUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return Student.objects.filter(school_id=self.request.school_id)

    def _validate_school_year_constraints(self, groups, allow_multiple):
        if allow_multiple:
            return
        seen_years = {}
        for group in groups:
            if not group.school_year_id:
                continue
            if group.school_year_id in seen_years:
                raise PermissionDenied(
                    "Student already assigned to a group in this school year"
                )
            seen_years[group.school_year_id] = group.id

    def update(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group_ids = serializer.validated_data.get("group_ids", [])
        replace_existing = serializer.validated_data.get("replace_existing", True)
        allow_multiple = serializer.validated_data.get("allow_multiple_groups", False)

        groups = list(
            Group.objects.filter(id__in=group_ids, school_id=request.school_id)
        )
        if len(groups) != len(set(group_ids)):
            raise PermissionDenied("Group mismatch for school")

        existing_memberships = GroupMembership.objects.filter(
            student=student, school_id=request.school_id
        )
        existing_group_ids = set(existing_memberships.values_list("group_id", flat=True))
        target_group_ids = set(group_ids)

        if replace_existing:
            combined_groups = groups
        else:
            combined_groups = list(
                Group.objects.filter(
                    id__in=existing_group_ids, school_id=request.school_id
                )
            ) + groups
        self._validate_school_year_constraints(combined_groups, allow_multiple)

        if replace_existing:
            existing_memberships.exclude(group_id__in=target_group_ids).delete()
        new_group_ids = target_group_ids - existing_group_ids
        if new_group_ids:
            GroupMembership.objects.bulk_create(
                [
                    GroupMembership(
                        school_id=request.school_id,
                        student=student,
                        group_id=group_id,
                    )
                    for group_id in new_group_ids
                ]
            )

        final_group_ids = set(
            GroupMembership.objects.filter(
                student=student, school_id=request.school_id
            ).values_list("group_id", flat=True)
        )
        AuditLog.objects.create(
            school_id=request.school_id,
            actor=request.user,
            action="group_update",
            entity_type="student",
            entity_id=student.id,
            metadata={
                "from_groups": sorted(existing_group_ids),
                "to_groups": sorted(final_group_ids),
                "replace_existing": replace_existing,
                "allow_multiple_groups": allow_multiple,
            },
        )
        return Response(
            {
                "student": StudentSerializer(student).data,
                "group_ids": sorted(final_group_ids),
            },
            status=status.HTTP_200_OK,
        )


class ParentStudentListCreateView(generics.ListCreateAPIView):
    serializer_class = ParentStudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]
    pagination_class = DefaultPagination

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return ParentStudent.objects.filter(school_id=self.request.school_id)

    def perform_create(self, serializer):
        parent = serializer.validated_data["parent"]
        student = serializer.validated_data["student"]
        if parent.school_id != self.request.school_id or student.school_id != self.request.school_id:
            raise PermissionDenied("Parent or student mismatch for school")
        relation = serializer.save(school_id=self.request.school_id)
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="assign_parent",
            entity_type="student",
            entity_id=relation.student_id,
            metadata={"parent_id": relation.parent_id, "relationship": relation.relationship},
        )


class ParentStudentDeleteView(generics.DestroyAPIView):
    serializer_class = ParentStudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return ParentStudent.objects.filter(school_id=self.request.school_id)

    def perform_destroy(self, instance):
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="unassign_parent",
            entity_type="student",
            entity_id=instance.student_id,
            metadata={"parent_id": instance.parent_id},
        )
        instance.delete()


class CurrentSchoolView(generics.RetrieveAPIView):
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(School, pk=self.request.school_id)


class SchoolYearRolloverView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def post(self, request, *args, **kwargs):
        from_year = get_object_or_404(
            SchoolYear, pk=request.data.get("from_year"), school_id=request.school_id
        )
        to_year = get_object_or_404(
            SchoolYear, pk=request.data.get("to_year"), school_id=request.school_id
        )
        dry_run = request.data.get("dry_run")
        args = [from_year.id, to_year.id, "--confirm"]
        if dry_run:
            args.append("--dry-run")
        output = io.StringIO()
        try:
            call_command("rollover_school_year", *args, stdout=output)
        except CommandError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": output.getvalue().strip()})


class GroupListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return Group.objects.filter(
            school_id=self.request.school_id, school_year__is_current=True
        )


class GroupDetailView(generics.RetrieveAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(school_id=self.request.school_id)


class GroupCreateView(generics.CreateAPIView):
    serializer_class = GroupCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not is_director(self.request.user):
            raise PermissionDenied("Only directors can create groups")
        school_year = SchoolYear.objects.filter(
            school_id=self.request.school_id, is_current=True
        ).first()
        group = serializer.save(
            school_id=self.request.school_id,
            school_year=school_year,
        )
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="create",
            entity_type="group",
            entity_id=group.id,
            metadata={"school_year_id": school_year.id if school_year else None},
        )


class AssignHomeroomTeacherView(generics.UpdateAPIView):
    serializer_class = AssignHomeroomTeacherSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        if not is_director(self.request.user):
            raise PermissionDenied("Only directors can assign homeroom teachers")
        group = serializer.save()
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="assign_homeroom",
            entity_type="group",
            entity_id=group.id,
            metadata={"homeroom_teacher_id": group.homeroom_teacher_id},
        )


class AssignSpecialistView(generics.CreateAPIView):
    serializer_class = SpecialistAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not is_director(self.request.user):
            raise PermissionDenied("Only directors can assign specialists")
        group = get_object_or_404(
            Group, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        teacher = serializer.validated_data["teacher"]
        if teacher.school_id != self.request.school_id:
            raise PermissionDenied("Teacher mismatch for school")
        serializer.save(group=group, school_id=self.request.school_id)


class VocalAssignmentCreateView(generics.CreateAPIView):
    serializer_class = VocalAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        group = serializer.validated_data["group"]
        if not (is_director(user) or group.homeroom_teacher_id == user.id):
            raise PermissionDenied(
                "Only directors or homeroom teachers can assign vocals"
            )
        serializer.save(school_id=self.request.school_id, assigned_by=user)


class VocalAssignmentDeactivateView(generics.UpdateAPIView):
    serializer_class = VocalAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VocalAssignment.objects.filter(
            school_id=self.request.school_id, active=True
        )

    def update(self, request, *args, **kwargs):
        assignment = self.get_object()
        user = request.user
        group = assignment.group
        if not (is_director(user) or group.homeroom_teacher_id == user.id):
            raise PermissionDenied(
                "Only directors or homeroom teachers can deactivate vocal assignments"
            )
        assignment.active = False
        assignment.end_at = timezone.now()
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GroupMembersView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        group = get_object_or_404(
            Group, pk=self.kwargs["pk"], school_id=request.school_id
        )
        user = request.user
        allowed = False
        if is_director(user):
            allowed = True
        elif group.homeroom_teacher_id == user.id:
            allowed = True
        elif SpecialistAssignment.objects.filter(group=group, teacher=user).exists():
            allowed = True
        elif VocalAssignment.objects.filter(
            group=group, parent=user, active=True
        ).exists():
            allowed = True
        if not allowed:
            raise PermissionDenied("Not allowed to view group members")

        students = Student.objects.filter(memberships__group=group)
        parents = (
            User.objects.filter(
                children_relations__student__memberships__group=group
            ).distinct()
        )
        specialists = User.objects.filter(
            specialist_assignments__group=group
        ).distinct()
        homeroom_teacher = None
        if group.homeroom_teacher_id:
            homeroom_teacher = User.objects.filter(
                id=group.homeroom_teacher_id
            ).first()
        return Response(
            {
                "students": StudentSerializer(students, many=True).data,
                "parents": UserSerializer(parents, many=True).data,
                "teachers": {
                    "homeroom": UserSerializer(homeroom_teacher).data if homeroom_teacher else None,
                    "specialists": UserSerializer(specialists, many=True).data,
                },
            }
        )


class GroupVocalsView(generics.ListAPIView):
    serializer_class = VocalAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group = get_object_or_404(
            Group, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        user = self.request.user
        allowed = False
        if is_director(user):
            allowed = True
        elif group.homeroom_teacher_id == user.id:
            allowed = True
        elif SpecialistAssignment.objects.filter(group=group, teacher=user).exists():
            allowed = True
        elif VocalAssignment.objects.filter(
            group=group, parent=user, active=True
        ).exists():
            allowed = True
        if not allowed:
            raise PermissionDenied("Not allowed to view vocal assignments")
        return VocalAssignment.objects.filter(
            school_id=self.request.school_id, group=group
        ).order_by("-start_at")


class ComplaintCreateView(generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ComplaintCreateThrottle]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ComplaintFilter

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        user = self.request.user
        qs = Complaint.objects.filter(school_id=self.request.school_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if is_director(user) or is_admin_tenant(user):
            return qs.order_by("-created_at")
        return (
            qs.filter(
                Q(created_by=user)
                | Q(target_teacher=user)
                | Q(participants__user=user)
            )
            .distinct()
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        user = self.request.user
        group = serializer.validated_data["group"]
        target_teacher = serializer.validated_data["target_teacher"]

        student_ids = ParentStudent.objects.filter(parent_id=user.id).values_list(
            "student_id", flat=True
        )
        has_child = GroupMembership.objects.filter(
            group=group, student_id__in=student_ids
        ).exists()
        if not has_child:
            raise PermissionDenied("Parent must have a child in the group")

        if not (
            is_maestro_titular(target_teacher)
            or is_maestro_itinerante(target_teacher)
        ):
            raise PermissionDenied(
                "Target must be homeroom or itinerant teacher"
            )
        assigned = group.homeroom_teacher_id == target_teacher.id or SpecialistAssignment.objects.filter(
            group=group, teacher=target_teacher
        ).exists()
        if not assigned:
            raise PermissionDenied("Teacher not assigned to group")

        serializer.save(created_by=user, school_id=self.request.school_id)


class ComplaintDetailView(generics.RetrieveAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def get_queryset(self):
        return Complaint.objects.filter(school_id=self.request.school_id)

    def retrieve(self, request, *args, **kwargs):
        complaint = self.get_object()
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=request.school_id,
            actor=request.user,
            action="read",
            entity_type="complaint",
            entity_id=complaint.id,
        )
        serializer = self.get_serializer(complaint)
        return Response(serializer.data)


class ComplaintMessageCreateView(generics.CreateAPIView):
    serializer_class = ComplaintMessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def perform_create(self, serializer):
        complaint = get_object_or_404(
            Complaint, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, complaint)
        message = serializer.save(complaint=complaint, author=self.request.user)
        from audit.models import AuditLog

        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="message_create",
            entity_type="complaint",
            entity_id=complaint.id,
            metadata={
                "complaint_id": complaint.id,
                "author_id": self.request.user.id,
                "message_id": message.id,
            },
        )


class ComplaintParticipantCreateView(generics.CreateAPIView):
    serializer_class = ComplaintParticipantSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def perform_create(self, serializer):
        complaint = get_object_or_404(
            Complaint, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, complaint)
        participant = serializer.save(
            complaint=complaint, added_by=self.request.user
        )
        from audit.models import AuditLog

        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="participant_add",
            entity_type="complaint",
            entity_id=complaint.id,
            metadata={
                "complaint_id": complaint.id,
                "user_added_id": participant.user_id,
            },
        )


class ComplaintStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ComplaintStatusSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def get_queryset(self):
        return Complaint.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        complaint = self.get_object()
        user = self.request.user
        prev_status = complaint.status
        new_status = serializer.validated_data["status"]
        if is_director(user) or user == complaint.target_teacher:
            pass
        elif user == complaint.created_by:
            if not (
                prev_status == Complaint.Status.OPEN
                and new_status == Complaint.Status.ESCALATED
            ):
                raise PermissionDenied("Cannot change status")
        else:
            raise PermissionDenied("Cannot change status")
        serializer.save()
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="status_change",
            entity_type="complaint",
            entity_id=complaint.id,
            metadata={"from": prev_status, "to": serializer.instance.status},
        )


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [EventCreateThrottle]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter

    def get_queryset(self):
        user = self.request.user
        qs = Event.objects.filter(school_id=self.request.school_id)
        qs = qs.filter(user_can_view_event(user)).distinct()
        params = self.request.query_params
        start = params.get("from")
        end = params.get("to")
        group_id = params.get("group_id")
        scope = params.get("scope")
        if start:
            dt = parse_datetime(start)
            if dt:
                qs = qs.filter(start_at__gte=dt)
        if end:
            dt = parse_datetime(end)
            if dt:
                qs = qs.filter(end_at__lte=dt)
        if group_id:
            qs = qs.filter(group_audiences__group_id=group_id)
        if scope:
            qs = qs.filter(scope=scope)
        return qs.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        scope = serializer.validated_data.get("scope")
        if scope == Event.Scope.GLOBAL and not is_director(user):
            raise PermissionDenied("Only directors can create global events")
        if scope == Event.Scope.GROUP:
            if not (
                is_director(user)
                or is_maestro_titular(user)
                or is_maestro_itinerante(user)
            ):
                raise PermissionDenied("Not allowed to create group events")
            groups = serializer.validated_data.get("groups", [])
            if is_maestro_titular(user):
                for group in groups:
                    if group.homeroom_teacher_id != user.id:
                        raise PermissionDenied(
                            "Cannot create event for this group"
                        )
            if is_maestro_itinerante(user):
                for group in groups:
                    if not SpecialistAssignment.objects.filter(
                        group=group, teacher=user
                    ).exists():
                        raise PermissionDenied(
                            "Cannot create event for this group"
                        )

        school_year = SchoolYear.objects.filter(
            school_id=self.request.school_id, is_current=True
        ).first()
        event = serializer.save(
            school_id=self.request.school_id,
            school_year=school_year,
            created_by=user,
        )
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="event_create",
            entity_type="event",
            entity_id=event.id,
            metadata={"scope": event.scope},
        )


class EventCancelView(generics.UpdateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(school_id=self.request.school_id)

    def update(self, request, *args, **kwargs):
        event = self.get_object()
        if not (is_director(request.user) or event.created_by_id == request.user.id):
            raise PermissionDenied("Cannot cancel this event")
        prev_status = event.status
        event.status = Event.Status.CANCELLED
        event.save()
        user_ids = get_event_audience_user_ids(event)
        if user_ids:
            push_to_users.delay(
                event.school_id,
                user_ids,
                f"Evento cancelado: {event.title}",
                f"Iba a iniciar {event.start_at:%Y-%m-%d %H:%M}",
                {"type": "event_cancelled", "event_id": event.id},
            )
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=request.user,
            action="event_cancel",
            entity_type="event",
            entity_id=event.id,
            metadata={"from": prev_status, "to": event.status},
        )
        serializer = self.get_serializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventAttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EventAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def _get_event(self):
        return get_object_or_404(
            Event, pk=self.kwargs["pk"], school_id=self.request.school_id
        )

    def get_queryset(self):
        event = self._get_event()
        if not can_view_event(self.request.user, event):
            raise PermissionDenied("Cannot view attachments for this event")
        return event.attachments.all()

    def perform_create(self, serializer):
        event = self._get_event()
        if not can_view_event(self.request.user, event):
            raise PermissionDenied("Cannot add attachment to this event")
        attachment = serializer.save(event=event)
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="event_attachment_upload",
            entity_type="event",
            entity_id=event.id,
            metadata={
                "attachment_id": attachment.id,
                "filename": attachment.filename,
                "mime": attachment.mime,
            },
        )


class EventPhotoListCreateView(generics.ListCreateAPIView):
    serializer_class = EventPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def _get_event(self):
        return get_object_or_404(
            Event, pk=self.kwargs["pk"], school_id=self.request.school_id
        )

    def get_queryset(self):
        event = self._get_event()
        if not can_view_event(self.request.user, event):
            raise PermissionDenied("Cannot view photos for this event")
        return event.photos.all().order_by("created_at")

    def perform_create(self, serializer):
        event = self._get_event()
        if not can_view_event(self.request.user, event):
            raise PermissionDenied("Cannot add photo to this event")
        photo = serializer.save(event=event)
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="event_photo_upload",
            entity_type="event",
            entity_id=event.id,
            metadata={"photo_id": photo.id, "caption": photo.caption},
        )


class EventRSVPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_event(self):
        return get_object_or_404(
            Event, pk=self.kwargs["pk"], school_id=self.request.school_id
        )

    @extend_schema(responses=EventRSVPStatusSerializer)
    def get(self, request, *args, **kwargs):
        event = self._get_event()
        if not can_view_event(request.user, event):
            raise PermissionDenied("Cannot view RSVP for this event")
        rsvp = EventRSVP.objects.filter(event=event, user=request.user).first()
        return Response({"status": rsvp.status if rsvp else None})

    @extend_schema(request=EventRSVPStatusSerializer, responses=EventRSVPStatusSerializer)
    def post(self, request, *args, **kwargs):
        event = self._get_event()
        if not can_view_event(request.user, event):
            raise PermissionDenied("Cannot RSVP to this event")
        status_value = request.data.get("status")
        if status_value not in EventRSVP.Status.values:
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        rsvp, _ = EventRSVP.objects.update_or_create(
            event=event, user=request.user, defaults={"status": status_value}
        )
        return Response({"status": rsvp.status})


class ActivityPhotoListView(generics.ListAPIView):
    serializer_class = ActivityPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        group_id = self.kwargs["pk"]
        group_ids = _visible_group_ids(self.request.user)
        qs = ActivityPhoto.objects.filter(
            school_id=self.request.school_id
        ).filter(Q(group_id=group_id) | Q(homework__group_id=group_id))
        qs = qs.filter(
            Q(group_id__in=group_ids) | Q(homework__group_id__in=group_ids)
        )
        return qs


class ActivityPhotoCreateView(generics.CreateAPIView):
    serializer_class = ActivityPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        group = serializer.validated_data.get("group")
        homework = serializer.validated_data.get("homework")
        if group and group.school_id != self.request.school_id:
            raise PermissionDenied("Group mismatch for school")
        if homework and homework.school_id != self.request.school_id:
            raise PermissionDenied("Homework mismatch for school")
        group_ref = group or (homework.group if homework else None)
        if group_ref and not can_post_activity_photo(self.request.user, group_ref):
            raise PermissionDenied("Cannot add photo for this group")
        serializer.save(
            school_id=self.request.school_id, uploaded_by=self.request.user
        )

class EventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(school_id=self.request.school_id).filter(
            user_can_view_event(user)
        )

class EventUpdateView(generics.UpdateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(school_id=self.request.school_id).filter(
            user_can_view_event(user)
        )

    def update(self, request, *args, **kwargs):
        event = self.get_object()
        if not (is_director(request.user) or event.created_by_id == request.user.id):
            raise PermissionDenied("Only the creator or director may edit this event")
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        event = serializer.instance
        changes = {}
        for field, value in serializer.validated_data.items():
            old_value = getattr(event, field)
            if old_value != value:
                changes[field] = {"from": str(old_value), "to": str(value)}
        serializer.save()
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="event_update",
            entity_type="event",
            entity_id=event.id,
            metadata={"changes": changes},
        )


class AnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = Announcement.objects.filter(school_id=self.request.school_id)
        group_ids = _visible_group_ids(self.request.user)
        scope = self.request.query_params.get("scope")
        if scope == Announcement.Scope.GLOBAL:
            qs = qs.filter(scope=Announcement.Scope.GLOBAL)
        elif scope == Announcement.Scope.GRUPO:
            qs = qs.filter(scope=Announcement.Scope.GRUPO, group_id__in=group_ids)
        else:
            qs = qs.filter(
                Q(scope=Announcement.Scope.GLOBAL)
                | Q(group_id__in=group_ids)
            )
        return qs

    def perform_create(self, serializer):
        scope = serializer.validated_data.get("scope")
        group = serializer.validated_data.get("group")
        if scope == Announcement.Scope.GLOBAL:
            if not is_director(self.request.user):
                raise PermissionDenied("Only directors can create global announcements")
        elif scope == Announcement.Scope.GRUPO:
            if not _can_manage_group(self.request.user, group):
                raise PermissionDenied("Cannot create announcement for this group")
        serializer.save(school_id=self.request.school_id, teacher=self.request.user)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Announcement.objects.filter(school_id=self.request.school_id)
        group_ids = _visible_group_ids(self.request.user)
        return qs.filter(
            Q(scope=Announcement.Scope.GLOBAL) | Q(group_id__in=group_ids)
        )

    def perform_update(self, serializer):
        announcement = self.get_object()
        if announcement.scope == Announcement.Scope.GRUPO:
            if not _can_manage_group(self.request.user, announcement.group):
                raise PermissionDenied("Cannot edit this announcement")
        serializer.save()


class HomeworkListCreateView(generics.ListCreateAPIView):
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        group_ids = _visible_group_ids(self.request.user)
        return Homework.objects.filter(
            school_id=self.request.school_id, group_id__in=group_ids
        )

    def perform_create(self, serializer):
        group = serializer.validated_data.get("group")
        if not _can_manage_group(self.request.user, group):
            raise PermissionDenied("Cannot create homework for this group")
        serializer.save(
            school_id=self.request.school_id, teacher=self.request.user
        )


class HomeworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _visible_group_ids(self.request.user)
        return Homework.objects.filter(
            school_id=self.request.school_id, group_id__in=group_ids
        )

    def perform_update(self, serializer):
        homework = self.get_object()
        if not _can_manage_group(self.request.user, homework.group):
            raise PermissionDenied("Cannot edit this homework")
        serializer.save()


class FeedView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        group_ids = _visible_group_ids(request.user)
        announcements = Announcement.objects.filter(
            school_id=request.school_id
        ).filter(
            Q(scope=Announcement.Scope.GLOBAL) | Q(group_id__in=group_ids)
        )
        homeworks = Homework.objects.filter(
            school_id=request.school_id, group_id__in=group_ids
        )
        ann_data = AnnouncementSerializer(announcements, many=True, context={"request": request}).data
        for item in ann_data:
            item["type"] = "announcement"
        hw_data = HomeworkSerializer(homeworks, many=True, context={"request": request}).data
        for item in hw_data:
            item["type"] = "homework"
        items = ann_data + hw_data
        items.sort(key=lambda x: x["created_at"], reverse=True)
        return Response(items)
