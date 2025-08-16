"""Base classes for notification providers."""

from abc import ABC, abstractmethod
from typing import Iterable, Dict, Any


class NotificationProvider(ABC):
    """Interface that all notification providers must implement."""

    @abstractmethod
    def send(
        self,
        recipients: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """Send a notification to the given recipients.

        Parameters
        ----------
        recipients:
            Iterable of identifiers for the target users (emails, phone numbers,
            push tokens, etc.).
        title:
            Notification title or subject.
        body:
            Notification body.
        data:
            Optional extra payload for providers that support it.

        Returns
        -------
        Dict[str, Any]
            Provider specific information about the delivery.
        """

        raise NotImplementedError
