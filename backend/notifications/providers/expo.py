import json, urllib.request
from typing import Iterable, Dict, Any
from .base import NotificationProvider

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

class ExpoProvider(NotificationProvider):
    def send(self, tokens: Iterable[str], title: str, body: str, data: Dict[str, Any] | None = None) -> Dict[str, Any]:
        messages = []
        for t in tokens:
            messages.append({
                "to": t, "title": title, "body": body, "sound": "default",
                "data": data or {},
            })
        req = urllib.request.Request(EXPO_PUSH_URL, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, data=json.dumps(messages).encode("utf-8")) as resp:
            payload = resp.read()
            return {"status": resp.status, "payload": payload.decode("utf-8")}
