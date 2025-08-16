from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from collections import defaultdict

from core.models import User
from notifications.tasks import push_to_users
from .models import FundraisingGroupLedger


@shared_task
def weekly_fundraising_summary():
    now = timezone.now()
    start = now - timedelta(days=7)
    ledgers = FundraisingGroupLedger.objects.filter(created_at__gte=start, created_at__lt=now)
    summary = ledgers.values(
        "event_id",
        "event__name",
        "group_id",
        "group__name",
        "event__school_id",
    ).annotate(total=Sum("amount_collected")).order_by("event_id", "group_id")

    data_per_school = defaultdict(list)
    for item in summary:
        data_per_school[item["event__school_id"]].append(item)

    for school_id, items in data_per_school.items():
        user_ids = list(
            User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True)
        )
        if not user_ids:
            continue
        lines = [f"{i['event__name']} - {i['group__name']}: {i['total']}" for i in items]
        body = "\n".join(lines)
        push_to_users.delay(
            school_id,
            user_ids,
            "Resumen semanal de recaudación",
            body,
            {"type": "fundraising_summary"},
        )

    return list(summary)
