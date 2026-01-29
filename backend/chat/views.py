from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import GroupChat, ChatMessage
from .serializers import ChatMessageSerializer
from core.models import Group
from core.permissions import can_view_chat, can_post_chat, is_director
from core.throttles import ChatMessageThrottle
from core.pagination import DefaultPagination

class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ChatMessageThrottle]
    pagination_class = DefaultPagination

    def get_queryset(self):
        group = get_object_or_404(
            Group, pk=self.kwargs["group_id"], school_id=self.request.school_id
        )
        if not can_view_chat(self.request.user, group):
            raise PermissionDenied("Cannot view messages")
        self.group = group
        chat, _ = GroupChat.objects.get_or_create(group=group)
        qs = chat.messages.order_by("created_at")
        query = self.request.query_params.get("q")
        author = self.request.query_params.get("author")
        if query:
            qs = qs.filter(message_text__icontains=query)
        if author:
            try:
                author_id = int(author)
                qs = qs.filter(author_id=author_id)
            except (TypeError, ValueError):
                qs = qs.filter(author__username__icontains=author)
        return qs

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
        channel_layer = get_channel_layer()
        payload = ChatMessageSerializer(message).data
        async_to_sync(channel_layer.group_send)(
            f"group_chat_{group.id}",
            {"type": "chat_message", "payload": payload},
        )
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=self.request.user,
            action="create",
            entity_type="chat_message",
            entity_id=message.id,
            metadata={"group_id": group.id},
        )
