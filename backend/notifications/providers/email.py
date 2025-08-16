from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Iterable, Dict, Any

from .base import NotificationProvider


class EmailProvider(NotificationProvider):
    """Simple SMTP email provider."""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 25,
        username: str | None = None,
        password: str | None = None,
        use_tls: bool = False,
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls

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

        msg = EmailMessage()
        msg["Subject"] = title
        msg["From"] = self.username or "noreply@example.com"
        msg["To"] = ", ".join(recipients)
        msg.set_content(body)

        with smtplib.SMTP(self.host, self.port) as smtp:
            if self.use_tls:
                smtp.starttls()
            if self.username and self.password:
                smtp.login(self.username, self.password)
            smtp.send_message(msg)
        return {"sent": len(recipients)}
