from __future__ import annotations

from typing import Iterable, Dict, Any
import requests

from .base import NotificationProvider


class SMSProvider(NotificationProvider):
    """Send WhatsApp/SMS messages via HTTP API."""

    def __init__(self, api_url: str = "https://example.org/send", token: str | None = None):
        self.api_url = api_url
        self.token = token

    def send(
        self,
        recipients: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        recipients = list(recipients)
        if not recipients:
            return {"sent": 0}

        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        for number in recipients:
            payload = {"to": number, "message": f"{title}: {body}"}
            requests.post(self.api_url, json=payload, headers=headers, timeout=5)

        return {"sent": len(recipients)}
