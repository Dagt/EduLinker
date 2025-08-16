import pytest
from unittest.mock import patch

from core.models import School, User
from notifications.models import NotificationPreference
from notifications.tasks import send_notification


@pytest.mark.django_db
def test_email_provider_respects_preferences():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    u1 = User.objects.create_user(
        username="u1@x.com", email="u1@x.com", password="p", role="PADRE", school=school
    )
    u2 = User.objects.create_user(
        username="u2@x.com", email="u2@x.com", password="p", role="PADRE", school=school
    )
    NotificationPreference.objects.create(school=school, user=u1, kind="event", enabled=False)

    with patch("notifications.providers.email.EmailProvider.send", return_value={"sent": 1}) as mock_send:
        result = send_notification.run(
            "email", school.id, [u1.id, u2.id], "T", "B", kind="event"
        )

    assert result["sent"] == 1
    mock_send.assert_called_once()
    assert mock_send.call_args[0][0] == [u2.email]


@pytest.mark.django_db
def test_sms_provider_respects_preferences():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    u1 = User.objects.create_user(
        username="u1@x.com", email="u1@x.com", password="p", role="PADRE", school=school, phone="111"
    )
    u2 = User.objects.create_user(
        username="u2@x.com", email="u2@x.com", password="p", role="PADRE", school=school, phone="222"
    )
    NotificationPreference.objects.create(school=school, user=u1, kind="event", enabled=False)

    with patch("notifications.providers.whatsapp.WhatsAppProvider.send", return_value={"sent": 1}) as mock_send:
        result = send_notification.run(
            "sms", school.id, [u1.id, u2.id], "T", "B", kind="event"
        )

    assert result["sent"] == 1
    mock_send.assert_called_once()
    assert mock_send.call_args[0][0] == [u2.phone]

