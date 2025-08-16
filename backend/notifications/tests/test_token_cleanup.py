import json
import urllib.error
from unittest.mock import patch

import pytest

from core.models import School, User
from notifications.models import DeviceToken, ExpoTicket
from notifications import tasks
from notifications.tasks import push_to_users
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
@pytest.mark.parametrize("error_code", ["DeviceNotRegistered", "InvalidCredentials"])
def test_cleanup_deletes_invalid_tokens(error_code):
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
            "t2": {"status": "error", "details": {"error": error_code}},
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


@pytest.mark.django_db
def test_cleanup_handles_http_error():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(
        username="u@x.com", email="u@x.com", password="p", role="PADRE", school=school
    )
    DeviceToken.objects.create(school=school, user=user, token="tok", platform="web")
    ExpoTicket.objects.create(ticket_id="t1", token="tok")

    def fake_urlopen(req, data=None):
        raise urllib.error.HTTPError(req.full_url, 500, "err", None, None)

    with patch("notifications.tasks.urllib.request.urlopen", side_effect=fake_urlopen):
        result = tasks.cleanup_invalid_tokens.run()

    assert result == {"processed": 0, "deleted": 0}
    assert DeviceToken.objects.filter(token="tok").exists()
    assert ExpoTicket.objects.filter(ticket_id="t1").exists()


@pytest.mark.django_db
def test_send_then_cleanup_cycle():
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
    first_receipts = {"data": {}}

    def fake_send(req, data=None):
        if req.full_url == expo.EXPO_PUSH_URL:
            return FakeResponse(json.dumps(send_payload))
        if req.full_url == expo.EXPO_RECEIPTS_URL:
            return FakeResponse(json.dumps(first_receipts))
        raise AssertionError("Unexpected URL")

    with patch("notifications.providers.expo.urllib.request.urlopen", side_effect=fake_send):
        send_result = push_to_users.run(school.id, [user1.id, user2.id], "T", "B")

    assert send_result["invalid"] == 0
    assert ExpoTicket.objects.count() == 2

    second_receipts = {
        "data": {
            "t1": {"status": "ok"},
            "t2": {"status": "error", "details": {"error": "DeviceNotRegistered"}},
        }
    }

    def fake_cleanup(req, data=None):
        assert req.full_url == expo.EXPO_RECEIPTS_URL
        return FakeResponse(json.dumps(second_receipts))

    with patch("notifications.tasks.urllib.request.urlopen", side_effect=fake_cleanup):
        cleanup_result = tasks.cleanup_invalid_tokens.run()

    assert cleanup_result["processed"] == 2
    assert cleanup_result["deleted"] == 1
    assert DeviceToken.objects.filter(token="tok1").exists()
    assert not DeviceToken.objects.filter(token="tok2").exists()
    assert ExpoTicket.objects.count() == 0

