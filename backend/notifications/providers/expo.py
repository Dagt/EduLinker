# backend/notifications/providers/expo.py
import json, urllib.request, urllib.error
from typing import Iterable, Dict, Any, List, Tuple

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts"

def _chunk(tokens: List[str], size: int = 95) -> List[List[str]]:
    return [tokens[i:i+size] for i in range(0, len(tokens), size)]

class ExpoProvider:
    def send_and_get_receipts(self, tokens: Iterable[str], title: str, body: str, data: Dict[str, Any] | None = None) -> Tuple[List[str], Dict[str, Any]]:
        tokens = list(tokens)
        tickets: List[str] = []
        for batch in _chunk(tokens):
            messages = [{"to": t, "title": title, "body": body, "sound": "default", "data": data or {}} for t in batch]
            try:
                req = urllib.request.Request(EXPO_PUSH_URL, method="POST", headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, data=json.dumps(messages).encode("utf-8")) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                    # payload.data -> array of tickets with "id"
                    for item in payload.get("data", []):
                        if "id" in item:
                            tickets.append(item["id"])
            except urllib.error.HTTPError as e:
                # loggear si quieres
                pass

        receipts: Dict[str, Any] = {}
        if tickets:
            try:
                req = urllib.request.Request(EXPO_RECEIPTS_URL, method="POST", headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, data=json.dumps({"ids": tickets}).encode("utf-8")) as resp:
                    receipts = json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                pass
        return tickets, receipts
