from unittest.mock import patch

from notifications.providers.email import EmailProvider
from notifications.providers.sms import SMSProvider


def test_email_provider_sends_messages():
    provider = EmailProvider(host="smtp.example", port=25)
    with patch("smtplib.SMTP") as mock_smtp:
        instance = mock_smtp.return_value.__enter__.return_value
        res = provider.send(["a@example.com", "b@example.com"], "T", "B")
        assert res["sent"] == 2
        instance.send_message.assert_called_once()


def test_sms_provider_posts_to_api():
    provider = SMSProvider(api_url="https://api.test")
    with patch("notifications.providers.sms.requests.post") as mock_post:
        res = provider.send(["123", "456"], "T", "B")
        assert res["sent"] == 2
        assert mock_post.call_count == 2
