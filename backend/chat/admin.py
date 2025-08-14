from django.contrib import admin
from .models import GroupChat, ChatMessage

@admin.register(GroupChat)
class GroupChatAdmin(admin.ModelAdmin):
    list_display = ("id","group","created_at")
    list_filter = ("group",)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id","chat","author","created_at")
    search_fields = ("message_text",)
