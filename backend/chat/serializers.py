from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    author_role = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ["id", "author", "author_role", "message_text", "created_at"]

    def get_author_role(self, obj):
        return obj.author.role
