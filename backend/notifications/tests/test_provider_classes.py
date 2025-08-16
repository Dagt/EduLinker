import smtplib
from unittest.mock import patch

from notifications.providers.email import EmailProvider
from notifications.providers.whatsapp import WhatsAppProvider


def test_email_provider_sends_messages_to_all_recipients():
    emails = ["a@example.com", "b@example.com"]
    provider = EmailProvider(host="smtp.example.com", port=2525, from_email="no-reply@example.com")

    with patch.object(smtplib, "SMTP") as mock_smtp:
        instance = mock_smtp.return_value.__enter__.return_value
        result = provider.send(emails, "Subject", "Body")

    assert result == {"sent": 2}
    expected_msg = "Subject: Subject\n\nBody"
    instance.sendmail.assert_any_call("no-reply@example.com", ["a@example.com"], expected_msg)
    instance.sendmail.assert_any_call("no-reply@example.com", ["b@example.com"], expected_msg)


def test_whatsapp_provider_counts_numbers():
    provider = WhatsAppProvider()
    result = provider.send(["123", "456", "789"], "t", "b")
    assert result == {"sent": 3}
