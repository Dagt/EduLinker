from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import GroupChat, ChatMessage
from .serializers import ChatMessageSerializer
from core.models import (
    Group,
    GroupMembership,
    ParentStudent,
    VocalAssignment,
    SpecialistAssignment,
)
from core.permissions import (
    is_director,
    is_maestro_titular,
    is_maestro_itinerante,
    is_vocal,
    is_padre,
)


def can_view_chat(user, group):
    """Determina si el usuario puede ver el chat del grupo."""
    if user.school_id != group.school_id:
        return False
    if is_director(user):
        return True
    if is_maestro_titular(user) and group.homeroom_teacher_id == user.id:
        return True
    if is_maestro_itinerante(user) and SpecialistAssignment.objects.filter(group=group, teacher=user).exists():
        return True
    if is_vocal(user) and VocalAssignment.objects.filter(group=group, parent=user, active=True).exists():
        return True
    if is_padre(user):
        student_ids = ParentStudent.objects.filter(parent=user).values_list("student_id", flat=True)
        return GroupMembership.objects.filter(group=group, student_id__in=student_ids).exists()
    return False


def can_post_chat(user, group):
    """Determina si el usuario puede escribir en el chat del grupo."""
    if not can_view_chat(user, group):
        return False
    if is_director(user):
        return False
    return True

class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group = get_object_or_404(Group, pk=self.kwargs["group_id"], school_id=self.request.school_id)
        if not can_view_chat(self.request.user, group):
            raise PermissionDenied("Cannot view messages")
        chat, _ = GroupChat.objects.get_or_create(group=group)
        return chat.messages.order_by("created_at")

    def perform_create(self, serializer):
        group = get_object_or_404(Group, pk=self.kwargs["group_id"], school_id=self.request.school_id)
        if not can_post_chat(self.request.user, group):
            raise PermissionDenied("Cannot send message")
        chat, _ = GroupChat.objects.get_or_create(group=group)
        serializer.save(chat=chat, author=self.request.user)
