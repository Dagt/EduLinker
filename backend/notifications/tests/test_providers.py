import pytest
from unittest.mock import patch

from core.models import School, User
from notifications.models import DeviceToken, NotificationPreference
from notifications.tasks import send_notification


@pytest.mark.django_db
def test_expo_provider_respects_preferences():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    u1 = User.objects.create_user(
        username="u1@x.com", email="u1@x.com", password="p", role="PADRE", school=school
    )
    u2 = User.objects.create_user(
        username="u2@x.com", email="u2@x.com", password="p", role="PADRE", school=school
    )
    DeviceToken.objects.create(school=school, user=u1, token="tok1", platform="web")
    DeviceToken.objects.create(school=school, user=u2, token="tok2", platform="web")
    NotificationPreference.objects.create(school=school, user=u1, kind="event", enabled=False)

    with patch("notifications.tasks.ExpoProvider.send", return_value=([], [])) as mock_send:
        result = send_notification.run(
            "expo", school.id, [u1.id, u2.id], "T", "B", kind="event"
        )

    assert result["sent"] == 1
    mock_send.assert_called_once_with(["tok2"], "T", "B", {})
