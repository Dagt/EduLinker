# backend/notifications/providers/expo.py
import json, urllib.request, urllib.error
from typing import Iterable, Dict, Any, List, Tuple

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts"

def _chunk(tokens: List[str], size: int = 95) -> List[List[str]]:
    return [tokens[i:i+size] for i in range(0, len(tokens), size)]

class ExpoProvider:
    def send_and_get_receipts(
        self, tokens: Iterable[str], title: str, body: str, data: Dict[str, Any] | None = None
    ) -> Tuple[List[Tuple[str, str]], Dict[str, Any], List[str]]:
        tokens = list(tokens)
        token_ticket_map: Dict[str, str] = {}
        invalid_tokens: List[str] = []
        for batch in _chunk(tokens):
            messages = [
                {"to": t, "title": title, "body": body, "sound": "default", "data": data or {}}
                for t in batch
            ]
            try:
                req = urllib.request.Request(
                    EXPO_PUSH_URL, method="POST", headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, data=json.dumps(messages).encode("utf-8")) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                    for token, item in zip(batch, payload.get("data", [])):
                        if "id" in item:
                            token_ticket_map[item["id"]] = token
                        elif item.get("status") == "error":
                            details = item.get("details") or {}
                            if details.get("error") == "DeviceNotRegistered":
                                invalid_tokens.append(token)
            except urllib.error.HTTPError:
                pass

        receipts: Dict[str, Any] = {}
        ticket_ids = list(token_ticket_map.keys())
        if ticket_ids:
            try:
                req = urllib.request.Request(
                    EXPO_RECEIPTS_URL, method="POST", headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(
                    req, data=json.dumps({"ids": ticket_ids}).encode("utf-8")
                ) as resp:
                    receipts = json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError:
                pass

            data_obj = receipts.get("data", {})
            for tid, info in data_obj.items():
                if info.get("status") == "error":
                    details = info.get("details") or {}
                    if details.get("error") == "DeviceNotRegistered":
                        token = token_ticket_map.get(tid)
                        if token:
                            invalid_tokens.append(token)

        return list(token_ticket_map.items()), receipts, invalid_tokens
