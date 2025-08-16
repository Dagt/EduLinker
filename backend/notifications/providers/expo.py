# backend/notifications/providers/expo.py
import json, urllib.request, urllib.error
from typing import Iterable, Dict, Any, List, Tuple

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts"

# Expo may report a number of errors that indicate the provided token is no
# longer valid.  Any of these should lead to the token being discarded.
INVALID_TOKEN_ERRORS = {
    "DeviceNotRegistered",
    "InvalidCredentials",
    "MessageTooBig",
}

def _chunk(tokens: List[str], size: int = 95) -> List[List[str]]:
    return [tokens[i:i+size] for i in range(0, len(tokens), size)]

class ExpoProvider:
    def send_and_get_receipts(
        self,
        tokens: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Tuple[List[Tuple[str, str]], Dict[str, Any], List[str]]:
        """Send a push notification and retrieve the delivery receipts.

        The Expo API returns *tickets* for each sent message which must later be
        resolved into delivery receipts.  In order to relate those receipts back
        to the original device tokens we keep a mapping of ``ticket -> token``
        which is returned to the caller alongside the receipt payload.

        Returns a tuple ``(ticket_pairs, receipts, invalid_tokens)`` where
        ``ticket_pairs`` is a list of ``(ticket_id, token)`` tuples and
        ``invalid_tokens`` contains the subset of tokens deemed invalid either
        during the send step or when fetching receipts.
        """

        tokens = list(tokens)
        ticket_to_token: Dict[str, str] = {}
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
                            ticket_to_token[item["id"]] = token
                        elif item.get("status") == "error":
                            details = item.get("details") or {}
                            if details.get("error") in INVALID_TOKEN_ERRORS:
                                invalid_tokens.append(token)
            except urllib.error.HTTPError:
                pass

        receipts: Dict[str, Any] = {}
        ticket_ids = list(ticket_to_token.keys())
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
                    if details.get("error") in INVALID_TOKEN_ERRORS:
                        token = ticket_to_token.get(tid)
                        if token:
                            invalid_tokens.append(token)

        return list(ticket_to_token.items()), receipts, list(dict.fromkeys(invalid_tokens))
