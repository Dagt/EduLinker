from io import BytesIO
from types import SimpleNamespace
from unittest.mock import patch
import os

from chat.serializers import ChatMessageSerializer


def test_serializer_creates_text_message_without_attachment():
    author = SimpleNamespace(role="PADRE")
    data = {"author": author, "message_text": "hello"}
    created = SimpleNamespace(id=1)

    with patch("chat.serializers.ChatMessage.objects.create", return_value=created) as mock_create:
        serializer = ChatMessageSerializer()
        result = serializer.create(data)

    assert result is created
    assert mock_create.call_args[1]["message_type"] == "text"
    assert mock_create.call_args[1]["author_role"] == "PADRE"
    assert "attachment_url" not in mock_create.call_args[1]


def test_serializer_creates_attachment_message(tmp_path):
    author = SimpleNamespace(role="PADRE")
    fake_file = BytesIO(b"hello")
    fake_file.name = "hello.txt"
    data = {"author": author, "message_text": "hi", "attachment": fake_file}
    created = SimpleNamespace(id=2)
    class DummyS3:
        def upload_fileobj(self, *args, **kwargs):
            pass

        def generate_presigned_url(self, method, Params=None, ExpiresIn=None):
            return f"https://example.com/{Params['Key']}"

    env = {
        "AWS_ACCESS_KEY_ID": "x",
        "AWS_SECRET_ACCESS_KEY": "x",
        "AWS_STORAGE_BUCKET_NAME": "b",
        "AWS_REGION": "us-east-1",
    }

    with patch.dict(os.environ, env, clear=False):
        with patch(
            "chat.serializers.boto3.client", return_value=DummyS3()
        ) as mock_client, patch(
            "chat.serializers.ChatMessage.objects.create", return_value=created
        ) as mock_create:
            serializer = ChatMessageSerializer()
            result = serializer.create(data)

    assert result is created
    assert mock_client.called
    assert mock_create.call_args[1]["message_type"] == "attachment"
    assert "attachment_url" in mock_create.call_args[1]
