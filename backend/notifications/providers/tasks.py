from celery import shared_task
from django.db.models import Q
from .models import DeviceToken
from .providers.expo import ExpoProvider

def _active_tokens_for_users(user_ids, school_id):
    return list(
        DeviceToken.objects.filter(active=True, school_id=school_id, user_id__in=user_ids).values_list("token", flat=True)
    )

@shared_task
def push_to_users(school_id: int, user_ids: list[int], title: str, body: str, data: dict | None = None):
    tokens = _active_tokens_for_users(user_ids, school_id)
    if not tokens:
        return {"sent": 0}
    provider = ExpoProvider()
    res = provider.send(tokens, title=title, body=body, data=data or {})
    return {"sent": len(tokens), "result": res}
