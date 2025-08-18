import os
import uuid
import mimetypes

import boto3
from rest_framework import serializers

from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(write_only=True, required=False)
    author_display = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "author",
            "author_display",
            "author_role",
            "message_text",
            "attachment",
            "attachment_url",
            "message_type",
            "created_at",
        ]
        read_only_fields = [
            "author_display",
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
            s3 = boto3.client(
                "s3",
                endpoint_url=os.getenv("S3_ENDPOINT_URL"),
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION", "us-east-1"),
            )
            bucket = os.getenv("AWS_STORAGE_BUCKET_NAME")
            filename = getattr(attachment, "name", str(uuid.uuid4()))
            content_type = (
                getattr(attachment, "content_type", None)
                or mimetypes.guess_type(filename)[0]
                or "application/octet-stream"
            )
            key = f"chat/{uuid.uuid4()}-{filename}"
            attachment.seek(0)
            s3.upload_fileobj(attachment, bucket, key, ExtraArgs={"ContentType": content_type})
            url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=3600,
            )
            validated_data["attachment_url"] = url
            validated_data["message_type"] = "attachment"
        else:
            validated_data["message_type"] = "text"

        return ChatMessage.objects.create(**validated_data)

    def get_author_display(self, obj):
        author = getattr(obj, "author", None)
        if author is None:
            return None
        get_full_name = getattr(author, "get_full_name", None)
        if callable(get_full_name):
            full_name = get_full_name()
            if full_name:
                return full_name
        return str(author)

