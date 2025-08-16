from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Suggestion, SuggestionMessage
from .serializers import (
    SuggestionMessageSerializer,
    SuggestionSerializer,
    SuggestionStatusSerializer,
)
from .permissions import CanAccessSuggestion
from core.permissions import is_director, is_maestro_titular, is_padre, is_vocal

class SuggestionListCreateView(generics.ListCreateAPIView):
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Suggestion.objects.filter(school_id=self.request.school_id)
        group_id = self.request.query_params.get("group_id")
        if group_id:
            qs = qs.filter(group_id=group_id)

        if is_director(user):
            return qs

        # Users can only see suggestions they are allowed to access
        return qs.filter(
            Q(created_by=user)
            | Q(target_teacher=user)
            | Q(group__homeroom_teacher=user)
        )

    def perform_create(self, serializer):
        user = self.request.user
        # Padres, vocales y maestros titulares pueden crear sugerencias
        if not (is_padre(user) or is_vocal(user) or is_maestro_titular(user)):
            raise PermissionDenied("Not allowed to create suggestions")
        serializer.save(school_id=self.request.school_id, created_by=user)

class SuggestionRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """Retrieve a suggestion or update its status."""

    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def get_queryset(self):
        return Suggestion.objects.filter(school_id=self.request.school_id)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return SuggestionStatusSerializer
        return SuggestionSerializer

    def perform_update(self, serializer):
        suggestion = self.get_object()
        user = self.request.user
        if not (is_director(user) or user == suggestion.target_teacher):
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


class SuggestionMessageCreateView(generics.CreateAPIView):
    serializer_class = SuggestionMessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def perform_create(self, serializer):
        suggestion = get_object_or_404(
            Suggestion, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, suggestion)
        serializer.save(suggestion=suggestion, author=self.request.user)


