from typing import Iterable, Dict, Any

class NotificationProvider:
    def send(self, tokens: Iterable[str], title: str, body: str, data: Dict[str, Any] | None = None) -> Dict[str, Any]:
        raise NotImplementedError
