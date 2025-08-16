# backend/notifications/tasks.py
from celery import shared_task

from ..models import DeviceToken
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
    token_ticket_pairs, _, invalid_tokens = provider.send_and_get_receipts(
        tokens, title=title, body=body, data=data or {}
    )

    if invalid_tokens:
        DeviceToken.objects.filter(token__in=invalid_tokens).update(active=False)

    return {
        "sent": len(tokens),
        "tickets": len(token_ticket_pairs),
        "invalid": len(invalid_tokens),
    }
