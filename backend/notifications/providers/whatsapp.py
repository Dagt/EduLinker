"""WhatsApp notification provider stub."""

from typing import Iterable, Dict, Any

from .base import NotificationProvider


class WhatsAppProvider(NotificationProvider):
    """Stub WhatsApp provider. Implement integration with WhatsApp API."""

    def send(
        self,
        recipients: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        raise NotImplementedError("WhatsApp provider not configured")
