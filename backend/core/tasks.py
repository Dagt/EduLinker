from celery import shared_task
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum, Case, When, IntegerField
from collections import defaultdict

from core.models import Event, Complaint, User, Homework
from notifications.tasks import push_to_users
from surveys.models import Survey
from core.utils import get_group_audience_user_ids, get_event_audience_user_ids
from fundraising.models import FundraisingGroupLedger

@shared_task
def send_event_reminders():
    now = timezone.now()
    offsets = getattr(settings, "EVENT_REMINDER_OFFSETS", [24, 1])
    total_events = 0
    total_push = 0
    for offset in offsets:
        start = now + timedelta(hours=offset)
        end = start + timedelta(hours=1)
        events = Event.objects.filter(status="ACTIVE", start_at__range=(start, end))
        total_events += events.count()
        for ev in events:
            user_ids = get_event_audience_user_ids(ev)
            if user_ids:
                push_to_users.delay(
                    ev.school_id,
                    user_ids,
                    f"Recordatorio: {ev.title}",
                    f"Inicia {ev.start_at:%Y-%m-%d %H:%M}",
                    {"type": "event", "event_id": ev.id},
                )
                total_push += len(user_ids)
    return {"events": total_events, "recipients": total_push}

@shared_task
def send_homework_reminders():
    today = timezone.now().date()
    soon = today + timedelta(days=getattr(settings, "HOMEWORK_REMINDER_DAYS_AHEAD", 1))
    homeworks = Homework.objects.filter(due_date__range=(today, soon))
    total_push = 0
    for hw in homeworks:
        g = hw.group
        ids = set(get_group_audience_user_ids(hw.school_id, [g.id]))
        ids.update([hw.teacher_id] if hw.teacher_id else [])
        user_ids = [uid for uid in ids if uid]
        if user_ids:
            push_to_users.delay(
                hw.school_id,
                user_ids,
                f"Tarea próxima: {hw.title}",
                f"Entrega el {hw.due_date:%Y-%m-%d}",
                {"type": "homework", "homework_id": hw.id},
            )
            total_push += len(user_ids)
    return {"homeworks": homeworks.count(), "recipients": total_push}

@shared_task
def escalate_stale_complaints():
    days = getattr(settings, "COMPLAINT_ESCALATION_DAYS", 5)
    limit = timezone.now() - timedelta(days=days)
    stale = Complaint.objects.filter(status="OPEN", updated_at__lt=limit)
    for c in stale:
        c.status = "ESCALATED"; c.save(update_fields=["status","updated_at"])
        # notificar director
        director_ids = list(
            User.objects.filter(school_id=c.school_id, role="DIRECTOR").values_list("id", flat=True)
        )
        if director_ids:
            data = {"type": "complaint", "complaint_id": c.id}
            push_to_users.delay(
                c.school_id,
                director_ids,
                "Queja escalada",
                f"La queja #{c.id} ha sido escalada.",
                data,
            )
    return stale.count()

@shared_task
def remind_surveys_to_close():
    now = timezone.now()
    soon = now + timedelta(hours=getattr(settings, "SURVEY_REMINDER_HOURS_AHEAD", 24))
    surveys = Survey.objects.filter(status="ACTIVE", end_at__range=(now, soon))
    total_push = 0
    for s in surveys:
        if s.scope == "SCHOOL":
            user_ids = list(User.objects.filter(school_id=s.school_id, is_active=True).values_list("id", flat=True))
        else:
            user_ids = get_group_audience_user_ids(s.school_id, [s.group_id])
        if user_ids:
            push_to_users.delay(s.school_id, user_ids, f"Encuesta por cerrar: {s.title}", f"Cierra el {s.end_at:%Y-%m-%d %H:%M}", {"type": "survey", "survey_id": s.id})
            total_push += len(user_ids)
    return {"surveys": surveys.count(), "recipients": total_push}


@shared_task
def send_fundraising_weekly_summary():
    now = timezone.now()
    start = now - timedelta(days=7)
    ledgers = FundraisingGroupLedger.objects.filter(created_at__gte=start, created_at__lt=now)
    summary_qs = (
        ledgers.values(
            "event_id",
            "event__name",
            "group_id",
            "group__name",
            "event__school_id",
        )
        .annotate(
            total=Sum("amount_collected"),
            missing_evidence=Sum(
                Case(
                    When(expenses__isnull=True, then=1),
                    default=0,
                    output_field=IntegerField(),
                )
            ),
        )
        .order_by("event_id", "group_id")
    )

    summary = list(summary_qs)
    data_per_school = defaultdict(list)
    for item in summary:
        item["missing_evidence"] = item["missing_evidence"] > 0
        data_per_school[item["event__school_id"]].append(item)

    for school_id, items in data_per_school.items():
        director_ids = list(
            User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True)
        )
        if not director_ids:
            continue
        lines = []
        for i in items:
            line = f"{i['event__name']} - {i['group__name']}: {i['total']}"
            if i["missing_evidence"]:
                line += " (falta evidencia)"
            lines.append(line)
        body = "\n".join(lines)
        push_to_users.delay(
            school_id,
            director_ids,
            "Resumen semanal de recaudación",
            body,
            {"type": "fundraising_summary"},
        )

    return summary
