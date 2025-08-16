import tempfile

from rest_framework import serializers

from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "author",
            "author_role",
            "message_text",
            "attachment",
            "attachment_url",
            "message_type",
            "created_at",
        ]
        read_only_fields = [
            "author_role",
            "attachment_url",
            "message_type",
            "created_at",
        ]

    def create(self, validated_data):
        attachment = validated_data.pop("attachment", None)
        author = validated_data.get("author")
        if author:
            validated_data.setdefault("author_role", author.role)

        if attachment:
            tmp = tempfile.NamedTemporaryFile(delete=False)
            tmp.write(attachment.read())
            tmp_path = tmp.name
            tmp.close()
            validated_data["attachment_url"] = tmp_path
            validated_data["message_type"] = "attachment"
        else:
            validated_data["message_type"] = "text"

        return ChatMessage.objects.create(**validated_data)

