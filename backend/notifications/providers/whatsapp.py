from typing import Iterable, Dict, Any

from .base import NotificationProvider


class WhatsAppProvider(NotificationProvider):
    """Basic provider for WhatsApp/SMS messaging.

    This stub simply counts the numbers it would send messages to and returns
    that count. Integration with a real API can be added later.
    """

    def send(
        self,
        numbers: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        count = len(list(numbers))
        return {"sent": count}
