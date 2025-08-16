import json
from unittest.mock import patch

import pytest

from core.models import School, User
from notifications.models import DeviceToken, ExpoTicket
from notifications import tasks
from notifications.providers import expo


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
def test_cleanup_deletes_invalid_tokens():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(
        username="u@x.com", email="u@x.com", password="p", role="PADRE", school=school
    )
    DeviceToken.objects.create(school=school, user=user, token="tok1", platform="web")
    DeviceToken.objects.create(school=school, user=user, token="tok2", platform="web")

    ExpoTicket.objects.create(ticket_id="t1", token="tok1")
    ExpoTicket.objects.create(ticket_id="t2", token="tok2")

    receipts_payload = {
        "data": {
            "t1": {"status": "ok"},
            "t2": {"status": "error", "details": {"error": "DeviceNotRegistered"}},
        }
    }

    def fake_urlopen(req, data=None):
        assert req.full_url == expo.EXPO_RECEIPTS_URL
        return FakeResponse(json.dumps(receipts_payload))

    with patch("notifications.tasks.urllib.request.urlopen", side_effect=fake_urlopen):
        result = tasks.cleanup_invalid_tokens.run()

    assert result["deleted"] == 1
    assert DeviceToken.objects.filter(token="tok1").exists()
    assert not DeviceToken.objects.filter(token="tok2").exists()
    assert ExpoTicket.objects.count() == 0

