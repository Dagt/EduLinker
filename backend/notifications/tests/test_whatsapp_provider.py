import importlib
import json
import requests
import responses
from django.conf import settings

from notifications.providers import whatsapp as whatsapp_module


@responses.activate
def test_whatsapp_provider_success(monkeypatch):
    settings.WHATSAPP_API_URL = "https://api.example.com/messages"
    settings.WHATSAPP_API_TOKEN = "token"
    importlib.reload(whatsapp_module)
    responses.add(
        responses.POST,
        "https://api.example.com/messages",
        json={"messages": [{"id": "msg123"}]},
        status=200,
    )

    provider = whatsapp_module.WhatsAppProvider()
    result = provider.send(["12345"], "Hello", "World")

    assert result == {"sent": 1, "ids": ["msg123"]}
    call = responses.calls[0]
    assert call.request.headers["Authorization"] == "Bearer token"
    assert json.loads(call.request.body) == {
        "messaging_product": "whatsapp",
        "to": "12345",
        "type": "text",
        "text": {"preview_url": False, "body": "Hello\nWorld"},
    }


@responses.activate
def test_whatsapp_provider_error(monkeypatch, caplog):
    settings.WHATSAPP_API_URL = "https://api.example.com/messages"
    settings.WHATSAPP_API_TOKEN = "token"
    importlib.reload(whatsapp_module)
    responses.add(
        responses.POST,
        "https://api.example.com/messages",
        body=requests.ConnectionError("boom"),
    )

    provider = whatsapp_module.WhatsAppProvider()
    with caplog.at_level("ERROR"):
        result = provider.send(["12345"], "Hello", "World")

    assert result == {"sent": 0, "ids": []}
    assert "WhatsApp API request failed" in caplog.text

