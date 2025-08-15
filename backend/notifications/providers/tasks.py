# backend/notifications/tasks.py
from celery import shared_task

from ..models import DeviceToken, ExpoTicket
from .expo import ExpoProvider

def _active_tokens_for_users(user_ids, school_id):
    return list(
        DeviceToken.objects.filter(
            active=True, school_id=school_id, user_id__in=user_ids
        ).values_list("token", flat=True)
    )

@shared_task
def push_to_users(school_id: int, user_ids: list[int], title: str, body: str, data: dict | None = None):
    tokens = _active_tokens_for_users(user_ids, school_id)
    if not tokens:
        return {"sent": 0}
    provider = ExpoProvider()
    token_ticket_pairs, receipts = provider.send_and_get_receipts(
        tokens, title=title, body=body, data=data or {}
    )

    # store ticket -> token mapping
    ExpoTicket.objects.bulk_create(
        [ExpoTicket(ticket_id=ticket, token=token) for token, ticket in token_ticket_pairs]
    )

    # analyse receipts and deactivate invalid tokens
    try:
        data_obj = receipts.get("data", {})
        invalid_ticket_ids = [
            tid
            for tid, info in data_obj.items()
            if info.get("status") == "error"
            and (info.get("details") or {}).get("error") == "DeviceNotRegistered"
        ]
        if invalid_ticket_ids:
            tokens_to_deactivate = list(
                ExpoTicket.objects.filter(ticket_id__in=invalid_ticket_ids).values_list(
                    "token", flat=True
                )
            )
            if tokens_to_deactivate:
                DeviceToken.objects.filter(token__in=tokens_to_deactivate).update(active=False)
            ExpoTicket.objects.filter(ticket_id__in=invalid_ticket_ids).delete()
        # cleanup processed tickets
        ExpoTicket.objects.filter(ticket_id__in=data_obj.keys()).delete()
    except Exception:
        pass

    return {"sent": len(tokens), "tickets": len(token_ticket_pairs)}
