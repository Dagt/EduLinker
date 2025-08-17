"""HTTP based WhatsApp/SMS notification provider."""

from __future__ import annotations

import logging
from typing import Iterable, Dict, Any, List

import requests
from django.conf import settings

from .base import NotificationProvider


class WhatsAppProvider(NotificationProvider):
    """Send WhatsApp/SMS messages using an external HTTP API (e.g. Meta).

    It expects the following settings to be configured:

    ``WHATSAPP_API_URL``
        Full endpoint to send messages.
    ``WHATSAPP_API_TOKEN``
        Bearer token used for authentication.
    """

    def __init__(self, api_url: str | None = None, token: str | None = None, timeout: int = 10) -> None:
        self.api_url = api_url or getattr(settings, "WHATSAPP_API_URL", None)
        self.token = token or getattr(settings, "WHATSAPP_API_TOKEN", None)
        self.timeout = timeout
        self.logger = logging.getLogger(__name__)

    def send(
        self,
        numbers: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        if not self.api_url or not self.token:
            raise EnvironmentError("WhatsApp API credentials are not configured")

        sent: int = 0
        ids: List[str] = []
        message_text = f"{title}\n{body}" if title else body
        headers = {"Authorization": f"Bearer {self.token}"}

        for number in numbers:
            payload = {
                "messaging_product": "whatsapp",
                "to": number,
                "type": "text",
                "text": {"preview_url": False, "body": message_text},
            }
            try:
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout,
                )
                response.raise_for_status()
                ids.append(response.json().get("messages", [{}])[0].get("id", ""))
                sent += 1
            except requests.RequestException as exc:
                self.logger.error("WhatsApp API request failed: %s", exc)

        return {"sent": sent, "ids": ids}

