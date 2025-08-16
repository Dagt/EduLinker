from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

from core.models import (
    Event,
    Complaint,
    User,
    Group,
    GroupMembership,
    ParentStudent,
    SpecialistAssignment,
    VocalAssignment,
    Homework,
)
from surveys.models import Survey
from notifications.tasks import push_to_users

def notify_users(user_qs, subject, body):
    # Punto de integración: aquí puedes:
    # - Encolar emails (send_mail)
    # - Enviar push (Expo)
    # - Registrar en AuditLog
    for u in user_qs:
        # reemplaza por integración real
        pass

def _event_audience_user_ids(event):
    if event.scope == "GLOBAL":
        # Todos activos de la escuela (si quieres limitar a roles/familias, puedes hacerlo)
        return list(User.objects.filter(school_id=event.school_id, is_active=True).values_list("id", flat=True))
    # scope GROUP: director + titular + itinerantes + vocales + padres
    group_ids = list(event.group_audiences.values_list("group_id", flat=True))
    ids = set()
    ids.update(User.objects.filter(school_id=event.school_id, role="DIRECTOR").values_list("id", flat=True))
    ids.update(User.objects.filter(role="MAESTRO_TITULAR", school_id=event.school_id, id__in=Group.objects.filter(id__in=group_ids).values("homeroom_teacher_id")).values_list("id", flat=True))
    ids.update(
        SpecialistAssignment.objects.filter(
            group_id__in=group_ids, school_id=event.school_id
        ).values_list("teacher_id", flat=True)
    )
    ids.update(
        VocalAssignment.objects.filter(
            group_id__in=group_ids, active=True, school_id=event.school_id
        ).values_list("parent_id", flat=True)
    )
    student_ids = GroupMembership.objects.filter(
        group_id__in=group_ids, school_id=event.school_id
    ).values("student_id")
    parent_ids = ParentStudent.objects.filter(
        student_id__in=student_ids, school_id=event.school_id
    ).values_list("parent_id", flat=True)
    ids.update(parent_ids)
    return list(ids)

@shared_task
def send_event_reminders():
    now = timezone.now()
    soon = now + timedelta(hours=getattr(settings, "EVENT_REMINDER_HOURS_AHEAD", 24))
    events = Event.objects.filter(status="ACTIVE", start_at__range=(now, soon))
    total_push = 0
    for ev in events:
        user_ids = _event_audience_user_ids(ev)
        if user_ids:
            push_to_users.delay(ev.school_id, user_ids, f"Recordatorio: {ev.title}", f"Inicia {ev.start_at:%Y-%m-%d %H:%M}", {"type": "event", "event_id": ev.id})
            total_push += len(user_ids)
    return {"events": events.count(), "recipients": total_push}

@shared_task
def send_homework_reminders():
    today = timezone.now().date()
    soon = today + timedelta(days=getattr(settings, "HOMEWORK_REMINDER_DAYS_AHEAD", 1))
    homeworks = Homework.objects.filter(due_date__range=(today, soon))
    total_push = 0
    for hw in homeworks:
        ids = set()
        ids.update([hw.teacher_id])
        if hw.group.homeroom_teacher_id:
            ids.add(hw.group.homeroom_teacher_id)
        ids.update(
            SpecialistAssignment.objects.filter(
                group=hw.group, school_id=hw.school_id
            ).values_list("teacher_id", flat=True)
        )
        student_ids = GroupMembership.objects.filter(
            group=hw.group, school_id=hw.school_id
        ).values_list("student_id", flat=True)
        parent_ids = ParentStudent.objects.filter(
            student_id__in=student_ids, school_id=hw.school_id
        ).values_list("parent_id", flat=True)
        ids.update(parent_ids)
        user_ids = list(ids)
        if user_ids:
            push_to_users.delay(
                hw.school_id,
                user_ids,
                f"Tarea próxima: {hw.title}",
                f"Entrega {hw.due_date:%Y-%m-%d}",
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
        from core.models import User
        directors = User.objects.filter(school_id=c.school_id, role="DIRECTOR")
        notify_users(directors, "Queja escalada", f"La queja #{c.id} ha sido escalada.")
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
            g = s.group
            ids = set()
            ids.update(User.objects.filter(school_id=s.school_id, role="DIRECTOR").values_list("id", flat=True))
            ids.update([g.homeroom_teacher_id] if g.homeroom_teacher_id else [])
            ids.update(SpecialistAssignment.objects.filter(group=g).values_list("teacher_id", flat=True))
            ids.update(VocalAssignment.objects.filter(group=g, active=True).values_list("parent_id", flat=True))
            parent_ids = ParentStudent.objects.filter(student_id__in=GroupMembership.objects.filter(group=g).values("student_id")).values_list("parent_id", flat=True)
            ids.update(parent_ids)
            user_ids = list(ids)
        if user_ids:
            push_to_users.delay(s.school_id, user_ids, f"Encuesta por cerrar: {s.title}", f"Cierra el {s.end_at:%Y-%m-%d %H:%M}", {"type": "survey", "survey_id": s.id})
            total_push += len(user_ids)
    return {"surveys": surveys.count(), "recipients": total_push}
