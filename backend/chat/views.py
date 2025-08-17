from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import GroupChat, ChatMessage
from .serializers import ChatMessageSerializer
from core.models import Group
from core.permissions import can_view_chat, can_post_chat, is_director

class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group = get_object_or_404(
            Group, pk=self.kwargs["group_id"], school_id=self.request.school_id
        )
        if not can_view_chat(self.request.user, group):
            raise PermissionDenied("Cannot view messages")
        self.group = group
        chat, _ = GroupChat.objects.get_or_create(group=group)
        return chat.messages.order_by("created_at")

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if "audit" in request.query_params and is_director(request.user):
            from audit.models import AuditLog

            AuditLog.objects.create(
                school_id=request.school_id,
                actor=request.user,
                action="read",
                entity_type="chat_message",
                entity_id=self.group.id,
                metadata={"group_id": self.group.id},
            )
        return response

    def perform_create(self, serializer):
        group = get_object_or_404(Group, pk=self.kwargs["group_id"], school_id=self.request.school_id)
        if not can_post_chat(self.request.user, group):
            raise PermissionDenied("Cannot send message")
        chat, _ = GroupChat.objects.get_or_create(group=group)
        message = serializer.save(chat=chat, author=self.request.user)
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="create",
            entity_type="chat_message",
            entity_id=message.id,
            metadata={"group_id": group.id},
        )
