import json
from unittest.mock import patch

import pytest

from core.models import School, User
from notifications.models import DeviceToken
from notifications.providers import expo
from notifications.providers.tasks import push_to_users


class FakeResponse:
    def __init__(self, payload: str):
        self._payload = payload.encode("utf-8")

    def read(self):
        return self._payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        pass


@pytest.mark.django_db
def test_invalid_tokens_removed_after_receipt_error():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user1 = User.objects.create_user(
        username="u1@x.com", email="u1@x.com", password="p", role="PADRE", school=school
    )
    user2 = User.objects.create_user(
        username="u2@x.com", email="u2@x.com", password="p", role="PADRE", school=school
    )
    DeviceToken.objects.create(school=school, user=user1, token="tok1", platform="web")
    DeviceToken.objects.create(school=school, user=user2, token="tok2", platform="web")

    send_payload = {"data": [{"id": "t1"}, {"id": "t2"}]}
    receipts_payload = {
        "data": {
            "t1": {"status": "ok"},
            "t2": {"status": "error", "details": {"error": "DeviceNotRegistered"}},
        }
    }

    def fake_urlopen(req, data=None):
        if req.full_url == expo.EXPO_PUSH_URL:
            return FakeResponse(json.dumps(send_payload))
        if req.full_url == expo.EXPO_RECEIPTS_URL:
            return FakeResponse(json.dumps(receipts_payload))
        raise AssertionError("Unexpected URL")

    with patch("notifications.providers.expo.urllib.request.urlopen", side_effect=fake_urlopen):
        result = push_to_users.run(school.id, [user1.id, user2.id], "T", "B")

    assert result["invalid"] == 1
    assert DeviceToken.objects.filter(token="tok1").exists()
    assert not DeviceToken.objects.filter(token="tok2").exists()

