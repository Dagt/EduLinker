
from celery import shared_task

from .models import DeviceToken, ExpoTicket, FailedExpoTicket, NotificationPreference
from .providers import expo
from .providers.expo import ExpoProvider
from .providers.email import EmailProvider
from core.models import User


def _active_tokens_for_users(user_ids, school_id):
    return list(
        DeviceToken.objects.filter(
            active=True, school_id=school_id, user_id__in=user_ids
        ).values_list("token", flat=True)
    )


def _emails_for_users(user_ids, school_id):
    return list(
        User.objects.filter(
            school_id=school_id, id__in=user_ids, is_active=True
        ).values_list("email", flat=True)
    )


def _filter_user_ids_by_pref(school_id, user_ids, kind):
    if not kind:
        return list(user_ids)
    disabled = set(
        NotificationPreference.objects.filter(
            school_id=school_id, user_id__in=user_ids, kind=kind, enabled=False
        ).values_list("user_id", flat=True)
    )
    return [uid for uid in user_ids if uid not in disabled]


@shared_task
def send_notification(
    provider: str,
    school_id: int,
    user_ids: list[int],
    title: str,
    body: str,
    data: dict | None = None,
    kind: str | None = None,
):
    user_ids = _filter_user_ids_by_pref(school_id, user_ids, kind)
    if not user_ids:
        return {"sent": 0}

    provider = provider.lower()

    if provider == "expo":
        tokens = _active_tokens_for_users(user_ids, school_id)
        if not tokens:
            return {"sent": 0}
        provider_obj = ExpoProvider()
        token_ticket_pairs, invalid_tokens = provider_obj.send(
            tokens, title=title, body=body, data=data or {}
        )
        if token_ticket_pairs:
            ExpoTicket.objects.bulk_create(
                [
                    ExpoTicket(ticket_id=tid, token=tok)
                    for tid, tok in token_ticket_pairs
                    if tok not in invalid_tokens
                ]
            )
        if invalid_tokens:
            DeviceToken.objects.filter(token__in=invalid_tokens).update(active=False)
        return {
            "sent": len(tokens),
            "tickets": len(token_ticket_pairs),
            "invalid": len(invalid_tokens),
        }

    if provider == "email":
        emails = _emails_for_users(user_ids, school_id)
        if not emails:
            return {"sent": 0}
        provider_obj = EmailProvider()
        return provider_obj.send(emails, title=title, body=body, data=data or {})

    else:
        raise ValueError("Unknown provider")


@shared_task
def push_to_users(
    school_id: int,
    user_ids: list[int],
    title: str,
    body: str,
    data: dict | None = None,
    kind: str | None = None,
):
    return send_notification.run("expo", school_id, user_ids, title, body, data, kind)


@shared_task
def cleanup_invalid_tokens():
    """Deactivate device tokens reported as invalid by Expo.

    The task fetches stored Expo tickets, queries the Expo receipts API and
    marks as inactive any device tokens that are reported as invalid (for
    example ``DeviceNotRegistered`` or ``InvalidCredentials``).  Processed
    tickets are removed regardless of their status so that we do not query them
    again on subsequent runs.
    """
    tickets = list(ExpoTicket.objects.values_list("ticket_id", "token"))
    if not tickets:
        return {"processed": 0, "disabled": 0}

    ticket_map = {tid: tok for tid, tok in tickets}
    invalid_tokens: list[str] = []
    failed: list[FailedExpoTicket] = []

    provider_obj = ExpoProvider()
    payload = provider_obj.get_receipts(ticket_map.keys())
    if not payload:
        return {"processed": 0, "disabled": 0}

    for tid, info in (payload.get("data") or {}).items():
        status = info.get("status")
        if status == "error":
            details = info.get("details") or {}
            err = details.get("error") or "unknown"
            token = ticket_map.get(tid)
            if token:
                failed.append(
                    FailedExpoTicket(ticket_id=tid, token=token, error=err)
                )
                if err in expo.INVALID_TOKEN_ERRORS:
                    invalid_tokens.append(token)

    ExpoTicket.objects.filter(ticket_id__in=list(ticket_map.keys())).delete()

    if failed:
        FailedExpoTicket.objects.bulk_create(failed)
    if invalid_tokens:
        DeviceToken.objects.filter(token__in=set(invalid_tokens)).update(active=False)

    return {"processed": len(ticket_map), "disabled": len(invalid_tokens)}

