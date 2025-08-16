import json
import urllib.error
import urllib.request

from celery import shared_task

from .models import DeviceToken, ExpoTicket
from .providers.tasks import push_to_users  # re-export existing task
from .providers import expo


@shared_task
def cleanup_invalid_tokens():
    tickets = list(ExpoTicket.objects.all())
    if not tickets:
        return {"processed": 0, "deleted": 0}

    ticket_map = {t.ticket_id: t.token for t in tickets}
    invalid_tokens: list[str] = []

    try:
        req = urllib.request.Request(
            expo.EXPO_RECEIPTS_URL,
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(
            req, data=json.dumps({"ids": list(ticket_map.keys())}).encode("utf-8")
        ) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError:
        payload = {}

    for tid, info in (payload.get("data") or {}).items():
        if info.get("status") == "error":
            details = info.get("details") or {}
            if details.get("error") == "DeviceNotRegistered":
                token = ticket_map.get(tid)
                if token:
                    invalid_tokens.append(token)

    ExpoTicket.objects.filter(ticket_id__in=ticket_map.keys()).delete()

    if invalid_tokens:
        DeviceToken.objects.filter(token__in=invalid_tokens).delete()

    return {"processed": len(ticket_map), "deleted": len(invalid_tokens)}

