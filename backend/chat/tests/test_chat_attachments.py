import os
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import patch

import boto3
import requests
from moto import mock_aws

from chat.serializers import ChatMessageSerializer


@mock_aws
def test_upload_and_read_attachment():
    os.environ.setdefault("AWS_ACCESS_KEY_ID", "x")
    os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "x")
    os.environ.setdefault("AWS_STORAGE_BUCKET_NAME", "test-bucket")
    os.environ.setdefault("AWS_REGION", "us-east-1")

    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-bucket")

    author = SimpleNamespace(role="PADRE")
    fake_file = BytesIO(b"hello")
    fake_file.name = "hello.txt"
    data = {"author": author, "message_text": "hi", "attachment": fake_file}
    created = SimpleNamespace(id=1)

    with patch("chat.serializers.ChatMessage.objects.create", return_value=created) as mock_create:
        serializer = ChatMessageSerializer()
        result = serializer.create(data)

    assert result is created
    url = mock_create.call_args[1]["attachment_url"]
    assert url and "Signature=" in url
    assert mock_create.call_args[1]["message_type"] == "attachment"

    objs = s3.list_objects_v2(Bucket="test-bucket")
    assert objs["KeyCount"] == 1
    key = objs["Contents"][0]["Key"]
    body = s3.get_object(Bucket="test-bucket", Key=key)["Body"].read()
    assert body == b"hello"

    assert requests.get(url).content == b"hello"
