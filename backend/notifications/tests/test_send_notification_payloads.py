import pytest
from unittest.mock import patch

from core.models import School, User
from notifications.models import DeviceToken
from notifications.tasks import send_notification, push_to_users


@pytest.mark.django_db
def test_send_notification_builds_expo_payload():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    u1 = User.objects.create_user(
        username="u1", email="u1@example.com", password="p", role="PADRE", school=school
    )
    u2 = User.objects.create_user(
        username="u2", email="u2@example.com", password="p", role="PADRE", school=school
    )
    DeviceToken.objects.create(school=school, user=u1, token="tok1", platform="web")
    DeviceToken.objects.create(school=school, user=u2, token="tok2", platform="web")
    data = {"x": 1}
    with patch(
        "notifications.tasks.ExpoProvider.send", return_value=([], [])
    ) as mock_send:
        result = send_notification.run(
            "expo", school.id, [u1.id, u2.id], "T", "B", data=data
        )
    assert result["sent"] == 2
    mock_send.assert_called_once_with(["tok1", "tok2"], "T", "B", data)


@pytest.mark.django_db
def test_push_to_users_builds_expo_payload():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    u1 = User.objects.create_user(
        username="u1", email="u1@example.com", password="p", role="PADRE", school=school
    )
    u2 = User.objects.create_user(
        username="u2", email="u2@example.com", password="p", role="PADRE", school=school
    )
    DeviceToken.objects.create(school=school, user=u1, token="tok1", platform="web")
    DeviceToken.objects.create(school=school, user=u2, token="tok2", platform="web")
    data = {"y": 2}
    with patch(
        "notifications.tasks.ExpoProvider.send", return_value=([], [])
    ) as mock_send:
        result = push_to_users.run(
            school.id, [u1.id, u2.id], "T", "B", data=data
        )
    assert result["sent"] == 2
    mock_send.assert_called_once_with(["tok1", "tok2"], "T", "B", data)
