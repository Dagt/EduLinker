"""Email notification provider."""

from typing import Iterable, Dict, Any

from django.conf import settings
from django.core.mail import send_mail

from .base import NotificationProvider


class EmailProvider(NotificationProvider):
    """Send notifications via email using Django's email backend."""

    def send(
        self,
        recipients: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        recipient_list = [r for r in recipients if r]
        if not recipient_list:
            return {"sent": 0}

        sent = send_mail(
            subject=title,
            message=body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return {"sent": sent}
