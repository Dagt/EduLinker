"""SMS notification provider stub."""

from typing import Iterable, Dict, Any

from .base import NotificationProvider


class SmsProvider(NotificationProvider):
    """Stub SMS provider. Implement integration with an SMS gateway."""

    def send(
        self,
        recipients: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        raise NotImplementedError("SMS provider not configured")
