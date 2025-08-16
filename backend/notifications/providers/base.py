from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Iterable, Dict, Any

class NotificationProvider(ABC):
    """Common interface for notification backends."""

    @abstractmethod
    def send(
        self,
        recipients: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """Send a message to recipients and return metadata."""
        raise NotImplementedError
