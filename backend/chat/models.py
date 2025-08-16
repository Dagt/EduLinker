from django.db import models
from core.models import Group, User

class GroupChat(models.Model):
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name="chat")
    created_at = models.DateTimeField(auto_now_add=True)

class ChatMessage(models.Model):
    chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    author_role = models.CharField(max_length=20)
    message_text = models.TextField(blank=True)
    attachment_url = models.URLField(blank=True)
    message_type = models.CharField(max_length=20, default="text")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.author_role and self.author_id:
            self.author_role = self.author.role
        super().save(*args, **kwargs)
