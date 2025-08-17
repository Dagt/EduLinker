import smtplib
from unittest.mock import patch

import importlib
import responses
from django.conf import settings

from notifications.providers.email import EmailProvider
from notifications.providers import whatsapp as whatsapp_module


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


def test_whatsapp_provider_counts_numbers(monkeypatch):
    settings.WHATSAPP_API_URL = "https://api.example.com/messages"
    settings.WHATSAPP_API_TOKEN = "token"
    importlib.reload(whatsapp_module)
    with responses.RequestsMock() as rsps:
        rsps.add(responses.POST, "https://api.example.com/messages", json={"messages": [{"id": "1"}]}, status=200)
        rsps.add(responses.POST, "https://api.example.com/messages", json={"messages": [{"id": "2"}]}, status=200)
        rsps.add(responses.POST, "https://api.example.com/messages", json={"messages": [{"id": "3"}]}, status=200)
        provider = whatsapp_module.WhatsAppProvider()
        result = provider.send(["123", "456", "789"], "t", "b")
    assert result == {"sent": 3, "ids": ["1", "2", "3"]}
