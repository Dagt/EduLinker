import json
import urllib.error
import urllib.request

from celery import shared_task

from core.models import User

from .models import DeviceToken, ExpoTicket, FailedExpoTicket, NotificationPreference
from .providers import expo
from .providers.expo import ExpoProvider
from .providers.email import EmailProvider
from .providers.whatsapp import WhatsAppProvider


def _active_tokens_for_users(user_ids, school_id):
    return list(
        DeviceToken.objects.filter(
            active=True, school_id=school_id, user_id__in=user_ids
        ).values_list("token", flat=True)
    )


def _emails_for_users(user_ids, school_id):
    return list(
        User.objects.filter(id__in=user_ids, school_id=school_id).values_list(
            "email", flat=True
        )
    )


def _phones_for_users(user_ids, school_id):
    return [
        p
        for p in User.objects.filter(id__in=user_ids, school_id=school_id).values_list(
            "phone", flat=True
        )
        if p
    ]


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
        token_ticket_pairs, _, invalid_tokens = provider_obj.send_and_get_receipts(
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
            DeviceToken.objects.filter(token__in=invalid_tokens).delete()
        return {
            "sent": len(tokens),
            "tickets": len(token_ticket_pairs),
            "invalid": len(invalid_tokens),
        }

    elif provider == "email":
        emails = _emails_for_users(user_ids, school_id)
        provider_obj = EmailProvider()
        provider_obj.send(emails, title, body, data or {})
        return {"sent": len(emails)}

    elif provider in ("sms", "whatsapp"):
        numbers = _phones_for_users(user_ids, school_id)
        provider_obj = WhatsAppProvider()
        provider_obj.send(numbers, title, body, data or {})
        return {"sent": len(numbers)}

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
    """Remove device tokens reported as invalid by Expo.

    The task fetches stored Expo tickets, queries the Expo receipts API and
    deletes any device tokens that are reported as invalid (for example
    ``DeviceNotRegistered`` or ``InvalidCredentials``).  Processed tickets are
    removed regardless of their status so that we do not query them again on
    subsequent runs.
    """
    tickets = list(ExpoTicket.objects.values_list("ticket_id", "token"))
    if not tickets:
        return {"processed": 0, "deleted": 0}

    ticket_map = {tid: tok for tid, tok in tickets}
    invalid_tokens: list[str] = []
    failed: list[FailedExpoTicket] = []

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
    except (urllib.error.HTTPError, urllib.error.URLError):
        return {"processed": 0, "deleted": 0}

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
        DeviceToken.objects.filter(token__in=set(invalid_tokens)).delete()

    return {"processed": len(ticket_map), "deleted": len(invalid_tokens)}

