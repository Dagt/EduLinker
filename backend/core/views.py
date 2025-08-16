import io

from django.core.management import call_command
from django.core.management.base import CommandError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import (
    Announcement,
    Homework,
    Group,
    Complaint,
    ComplaintMessage,
    Event,
    School,
    SchoolYear,
    SpecialistAssignment,
    GroupMembership,
    ParentStudent,
    VocalAssignment,
    ActivityPhoto,
)
from .permissions import (
    CanAccessComplaint,
    can_post_activity_photo,
    can_view_event,
    user_can_view_event,
    is_director,
    is_maestro_itinerante,
    is_maestro_titular,
    is_padre,
    is_vocal,
    IsDirector,
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
    ActivityPhotoSerializer,
    GroupSerializer,
    GroupCreateSerializer,
    AssignHomeroomTeacherSerializer,
    SpecialistAssignmentSerializer,
    VocalAssignmentSerializer,
    UserSerializer,
)


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


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


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

    def get_queryset(self):
        return Group.objects.filter(
            school_id=self.request.school_id, school_year__is_current=True
        )


class GroupCreateView(generics.CreateAPIView):
    serializer_class = GroupCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not is_director(self.request.user):
            raise PermissionDenied("Only directors can create groups")
        school_year = SchoolYear.objects.filter(
            school_id=self.request.school_id, is_current=True
        ).first()
        serializer.save(
            school_id=self.request.school_id,
            school_year=school_year,
        )


class AssignHomeroomTeacherView(generics.UpdateAPIView):
    serializer_class = AssignHomeroomTeacherSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        if not is_director(self.request.user):
            raise PermissionDenied("Only directors can assign homeroom teachers")
        serializer.save()


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
        if not is_director(self.request.user):
            raise PermissionDenied("Only directors can assign vocals")
        serializer.save(
            school_id=self.request.school_id, assigned_by=self.request.user
        )


class VocalAssignmentDeactivateView(generics.UpdateAPIView):
    serializer_class = VocalAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VocalAssignment.objects.filter(
            school_id=self.request.school_id, active=True
        )

    def update(self, request, *args, **kwargs):
        assignment = self.get_object()
        if not is_director(request.user):
            raise PermissionDenied(
                "Only directors can deactivate vocal assignments"
            )
        assignment.active = False
        assignment.end_at = timezone.now()
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ComplaintCreateView(generics.CreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user, school_id=self.request.school_id
        )


class ComplaintDetailView(generics.RetrieveAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def get_queryset(self):
        return Complaint.objects.filter(school_id=self.request.school_id)


class ComplaintMessageCreateView(generics.CreateAPIView):
    serializer_class = ComplaintMessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def perform_create(self, serializer):
        complaint = get_object_or_404(
            Complaint, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, complaint)
        serializer.save(complaint=complaint, author=self.request.user)


class ComplaintParticipantCreateView(generics.CreateAPIView):
    serializer_class = ComplaintParticipantSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def perform_create(self, serializer):
        complaint = get_object_or_404(
            Complaint, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, complaint)
        serializer.save(complaint=complaint)


class ComplaintStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ComplaintStatusSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComplaint]

    def get_queryset(self):
        return Complaint.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        complaint = self.get_object()
        user = self.request.user
        if not (is_director(user) or user == complaint.target_teacher):
            raise PermissionDenied("Cannot change status")
        prev_status = complaint.status
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
            action="create",
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
        event.status = Event.Status.CANCELLED
        event.save()
        serializer = self.get_serializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventAttachmentCreateView(generics.CreateAPIView):
    serializer_class = EventAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event = get_object_or_404(
            Event, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        if not can_view_event(self.request.user, event):
            raise PermissionDenied("Cannot add attachment to this event")
        serializer.save(event=event)


class EventPhotoCreateView(generics.CreateAPIView):
    serializer_class = EventPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event = get_object_or_404(
            Event, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        if not can_view_event(self.request.user, event):
            raise PermissionDenied("Cannot add photo to this event")
        serializer.save(event=event)


class ActivityPhotoListView(generics.ListAPIView):
    serializer_class = ActivityPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        return Event.objects.filter(school_id=self.request.school_id)

class EventUpdateView(generics.UpdateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(school_id=self.request.school_id)

    def update(self, request, *args, **kwargs):
        event = self.get_object()
        if not (is_director(request.user) or event.created_by_id == request.user.id):
            raise PermissionDenied("Only the creator or director may edit this event")
        return super().update(request, *args, **kwargs)


class AnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _visible_group_ids(self.request.user)
        return Announcement.objects.filter(
            school_id=self.request.school_id, group_id__in=group_ids
        )

    def perform_create(self, serializer):
        group = serializer.validated_data.get("group")
        if not _can_manage_group(self.request.user, group):
            raise PermissionDenied("Cannot create announcement for this group")
        serializer.save(
            school_id=self.request.school_id, teacher=self.request.user
        )


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _visible_group_ids(self.request.user)
        return Announcement.objects.filter(
            school_id=self.request.school_id, group_id__in=group_ids
        )

    def perform_update(self, serializer):
        announcement = self.get_object()
        if not _can_manage_group(self.request.user, announcement.group):
            raise PermissionDenied("Cannot edit this announcement")
        serializer.save()


class HomeworkListCreateView(generics.ListCreateAPIView):
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

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
            school_id=request.school_id, group_id__in=group_ids
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
