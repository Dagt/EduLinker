from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Event
from .serializers import EventSerializer
from .permissions import can_view_event, is_director
from .models import Group, Complaint, ComplaintMessage, Event, SchoolYear, SpecialistAssignment
from .permissions import (
    CanAccessComplaint,
    can_post_activity_photo,
    can_view_event,
    is_director,
    is_maestro_itinerante,
    is_maestro_titular,
)
from .serializers import (
    ComplaintMessageSerializer,
    ComplaintParticipantSerializer,
    ComplaintSerializer,
    ComplaintStatusSerializer,
    EventAttachmentSerializer,
    EventPhotoSerializer,
    EventSerializer,
    ActivityPhotoSerializer,
    GroupSerializer,
    UserSerializer,
)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class GroupListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(
            school_id=self.request.school_id, school_year__is_current=True
        )


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
        qs = Event.objects.filter(school_id=self.request.school_id)
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
        return qs

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