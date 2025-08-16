"""Twilio based WhatsApp/SMS notification provider."""

from __future__ import annotations

import os
from typing import Iterable, Dict, Any, List

from twilio.rest import Client

from .base import NotificationProvider


class WhatsAppProvider(NotificationProvider):
    """Send WhatsApp/SMS messages using the Twilio API.

    The provider expects the following environment variables to be defined:

    ``TWILIO_ACCOUNT_SID``
        Account SID for the Twilio project.
    ``TWILIO_AUTH_TOKEN``
        Authentication token for the Twilio project.
    ``TWILIO_FROM_NUMBER``
        Phone number (or WhatsApp enabled number) used as the sender.
    """

    def __init__(self) -> None:
        self.account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        self.auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        self.from_number = os.environ.get("TWILIO_FROM_NUMBER")

        # The client is only initialised when credentials are available.  This
        # allows the class to be imported in environments where the variables
        # are missing (e.g. during tests where ``send`` is patched).
        if self.account_sid and self.auth_token:
            self.client: Client | None = Client(self.account_sid, self.auth_token)
        else:
            self.client = None

    def send(
        self,
        numbers: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        if not self.client or not self.from_number:
            raise EnvironmentError("Twilio credentials are not configured")

        sent: int = 0
        sids: List[str] = []

        for number in numbers:
            try:
                message = self.client.messages.create(
                    body=f"{title}\n{body}" if title else body,
                    from_=self.from_number,
                    to=number,
                )
                sent += 1
                # ``sid`` is the Twilio identifier for the message
                sids.append(getattr(message, "sid", ""))
            except Exception as exc:  # pragma: no cover - defensive
                return {"sent": sent, "error": str(exc)}

        return {"sent": sent, "sids": sids}

