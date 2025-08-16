# backend/notifications/providers/expo.py
import json
import logging
import urllib.error
import urllib.request
from typing import Any, Dict, Iterable, List, Tuple

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

logger = logging.getLogger(__name__)


class ExpoProvider:
    def send(
        self,
        tokens: Iterable[str],
        title: str,
        body: str,
        data: Dict[str, Any] | None = None,
    ) -> Tuple[List[Tuple[str, str]], List[str]]:
        """Send a push notification and return ticket/token pairs.

        Returns a tuple ``(ticket_pairs, invalid_tokens)``. ``ticket_pairs`` is a
        list of ``(ticket_id, token)`` tuples received from Expo. ``invalid_tokens``
        contains the subset of tokens deemed invalid during the send step.
        """

        tokens = list(tokens)
        ticket_pairs: List[Tuple[str, str]] = []
        invalid_tokens: List[str] = []
        for batch in _chunk(tokens):
            messages = [
                {
                    "to": t,
                    "title": title,
                    "body": body,
                    "sound": "default",
                    "data": data or {},
                }
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
                            ticket_id = item["id"]
                            ticket_pairs.append((ticket_id, token))
                            logger.debug("Expo ticket %s for token %s", ticket_id, token)
                        elif item.get("status") == "error":
                            details = item.get("details") or {}
                            if details.get("error") in INVALID_TOKEN_ERRORS:
                                invalid_tokens.append(token)
            except urllib.error.HTTPError:
                pass

        return ticket_pairs, list(dict.fromkeys(invalid_tokens))

    def get_receipts(self, ticket_ids: Iterable[str]) -> Dict[str, Any]:
        """Fetch delivery receipts for the given ticket ids."""

        ticket_ids = list(ticket_ids)
        if not ticket_ids:
            return {}
        try:
            req = urllib.request.Request(
                EXPO_RECEIPTS_URL, method="POST", headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(
                req, data=json.dumps({"ids": ticket_ids}).encode("utf-8")
            ) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.HTTPError, urllib.error.URLError):
            return {}
