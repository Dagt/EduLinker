from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Suggestion, SuggestionMessage
from .serializers import (
    SuggestionSerializer,
    SuggestionMessageSerializer,
    SuggestionStatusSerializer,
)
from core.permissions import (
    CanAccessSuggestion,
    can_create_suggestion,
    can_update_suggestion_status,
)

class SuggestionListCreateView(generics.ListCreateAPIView):
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Suggestion.objects.filter(school_id=self.request.school_id)
        group_id = self.request.query_params.get("group_id")
        if group_id:
            qs = qs.filter(group_id=group_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not can_create_suggestion(user):
            raise PermissionDenied("Not allowed to create suggestions")
        serializer.save(school_id=self.request.school_id, created_by=user)

class SuggestionDetailView(generics.RetrieveAPIView):
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def get_queryset(self):
        return Suggestion.objects.filter(school_id=self.request.school_id)

class SuggestionMessageCreateView(generics.CreateAPIView):
    serializer_class = SuggestionMessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def perform_create(self, serializer):
        suggestion = get_object_or_404(
            Suggestion, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        self.check_object_permissions(self.request, suggestion)
        serializer.save(suggestion=suggestion, author=self.request.user)


class SuggestionStatusUpdateView(generics.UpdateAPIView):
    queryset = Suggestion.objects.all()
    serializer_class = SuggestionStatusSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessSuggestion]

    def get_queryset(self):
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
