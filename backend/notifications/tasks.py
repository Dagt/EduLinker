from __future__ import annotations

from celery import shared_task
from core.models import User

from .models import DeviceToken, NotificationPreference
from .providers.expo import ExpoProvider
from .providers.email import EmailProvider
from .providers.sms import SMSProvider


def _filter_enabled(user_ids: list[int], school_id: int, kind: str | None) -> list[int]:
    if not kind:
        return user_ids
    disabled = set(
        NotificationPreference.objects.filter(
            school_id=school_id, user_id__in=user_ids, kind=kind, enabled=False
        ).values_list("user_id", flat=True)
    )
    return [uid for uid in user_ids if uid not in disabled]


@shared_task
def push_to_users(
    school_id: int,
    user_ids: list[int],
    title: str,
    body: str,
    data: dict | None = None,
    kind: str | None = None,
    providers: list[str] | None = None,
):
    """Send notification to users using available providers."""
    providers = providers or ["push"]
    user_ids = _filter_enabled(user_ids, school_id, kind)
    result: dict[str, dict[str, int]] = {}

    if "push" in providers:
        tokens = list(
            DeviceToken.objects.filter(
                active=True, school_id=school_id, user_id__in=user_ids
            ).values_list("token", flat=True)
        )
        if tokens:
            provider = ExpoProvider()
            token_ticket_pairs, _, invalid_tokens = provider.send_and_get_receipts(
                tokens, title=title, body=body, data=data or {}
            )
            if invalid_tokens:
                DeviceToken.objects.filter(token__in=invalid_tokens).delete()
            result["push"] = {
                "sent": len(tokens),
                "tickets": len(token_ticket_pairs),
                "invalid": len(invalid_tokens),
            }
        else:
            result["push"] = {"sent": 0}

    if "email" in providers:
        emails = list(
            User.objects.filter(id__in=user_ids, school_id=school_id).values_list(
                "email", flat=True
            )
        )
        if emails:
            EmailProvider().send(emails, title, body, data or {})
            result["email"] = {"sent": len(emails)}
        else:
            result["email"] = {"sent": 0}

    if "sms" in providers:
        phones = list(
            User.objects.filter(id__in=user_ids, school_id=school_id)
            .exclude(phone="")
            .values_list("phone", flat=True)
        )
        if phones:
            SMSProvider().send(phones, title, body, data or {})
            result["sms"] = {"sent": len(phones)}
        else:
            result["sms"] = {"sent": 0}

    return result
