import smtplib
from typing import Iterable, Dict, Any

from .base import NotificationProvider


class EmailProvider(NotificationProvider):
    """Simple SMTP email provider."""

    def __init__(self, host: str = "localhost", port: int = 25, from_email: str = "no-reply@example.com"):
        self.host = host
        self.port = port
        self.from_email = from_email

    def send(self, emails: Iterable[str], title: str, body: str, data: Dict[str, Any] | None = None) -> Dict[str, Any]:
        sent = 0
        with smtplib.SMTP(self.host, self.port) as smtp:
            for to in emails:
                msg = f"Subject: {title}\n\n{body}"
                smtp.sendmail(self.from_email, [to], msg)
                sent += 1
        return {"sent": sent}
