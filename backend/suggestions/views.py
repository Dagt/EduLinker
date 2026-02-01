from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils.dateparse import parse_date, parse_datetime
from django_filters.rest_framework import DjangoFilterBackend

from .models import Suggestion, SuggestionMessage
from .filters import SuggestionFilter
from .serializers import (
    SuggestionSerializer,
    SuggestionMessageSerializer,
    SuggestionStatusSerializer,
)
from core.permissions import (
    CanAccessSuggestion,
    can_create_suggestion,
    can_update_suggestion_status,
    is_director,
)
from core.models import User
from core.pagination import DefaultPagination
from audit.models import AuditLog

class SuggestionListCreateView(generics.ListCreateAPIView):
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = SuggestionFilter

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        user = self.request.user
        qs = Suggestion.objects.filter(school_id=self.request.school_id)
        if not is_director(user):
            qs = qs.filter(created_by=user)
        group_id = self.request.query_params.get("group_id")
        if group_id:
            qs = qs.filter(group_id=group_id)
        status_filter = self.request.query_params.get("status")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if date_from:
            start = parse_datetime(date_from) or parse_date(date_from)
            if start:
                qs = qs.filter(created_at__gte=start)
        if date_to:
            end = parse_datetime(date_to) or parse_date(date_to)
            if end:
                qs = qs.filter(created_at__lte=end)
        return qs

    def perform_create(self, serializer):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        user = self.request.user
        if not can_create_suggestion(user):
            raise PermissionDenied("Not allowed to create suggestions")
        director = User.objects.filter(
            school_id=self.request.school_id, role=User.Roles.DIRECTOR, is_active=True
        ).first()
        if not director:
            raise PermissionDenied("Director not available")
        suggestion = serializer.save(
            school_id=self.request.school_id,
            created_by=user,
            target_teacher=director,
        )
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="create",
            entity_type="suggestion",
            entity_id=suggestion.id,
        )

class SuggestionRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return Suggestion.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        suggestion = self.get_object()
        if suggestion.created_by != self.request.user:
            raise PermissionDenied("Cannot update suggestion")
        changes = {}
        for field, value in serializer.validated_data.items():
            old_value = getattr(suggestion, field)
            if old_value != value:
                changes[field] = {"from": str(old_value), "to": str(value)}
        suggestion = serializer.save()
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="update",
            entity_type="suggestion",
            entity_id=suggestion.id,
            metadata={"changes": changes},
        )

class SuggestionMessageCreateView(generics.CreateAPIView):
    serializer_class = SuggestionMessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def perform_create(self, serializer):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        suggestion = get_object_or_404(
            Suggestion, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, suggestion)
        message = serializer.save(suggestion=suggestion, author=self.request.user)
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="message_create",
            entity_type="suggestion",
            entity_id=suggestion.id,
            metadata={"message_id": message.id},
        )


class SuggestionStatusUpdateView(generics.UpdateAPIView):
    queryset = Suggestion.objects.all()
    serializer_class = SuggestionStatusSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")
        return Suggestion.objects.filter(school_id=self.request.school_id)

    def perform_update(self, serializer):
        suggestion = self.get_object()
        user = self.request.user
        if not can_update_suggestion_status(user, suggestion):
            raise PermissionDenied("Cannot change status")
        prev_status = suggestion.status
        serializer.save()
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="status_change",
            entity_type="suggestion",
            entity_id=suggestion.id,
            metadata={"from": prev_status, "to": serializer.instance.status},
        )
