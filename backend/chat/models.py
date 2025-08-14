from django.db import models
from core.models import Group, User

class GroupChat(models.Model):
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name="chat")
    created_at = models.DateTimeField(auto_now_add=True)

class ChatMessage(models.Model):
    chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    message_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
