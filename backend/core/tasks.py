from celery import shared_task
from django.utils import timezone
from datetime import timedelta

from core.models import Event, Complaint
from surveys.models import Survey
from django.conf import settings

def notify_users(user_qs, subject, body):
    # Punto de integración: aquí puedes:
    # - Encolar emails (send_mail)
    # - Enviar push (Expo)
    # - Registrar en AuditLog
    for u in user_qs:
        # reemplaza por integración real
        pass

def event_audience_users(event):
    from core.models import Group, GroupMembership, ParentStudent, VocalAssignment, User
    if event.scope == "GLOBAL":
        return User.objects.filter(school_id=event.school_id, is_active=True)
    # scope GROUP: juntar director, titular, itinerantes, vocales y padres del/los grupo(s)
    from django.db.models import Q
    group_ids = list(event.group_audiences.values_list("group_id", flat=True))
    users = User.objects.none()
    # Director
    users = users | User.objects.filter(school_id=event.school_id, role="DIRECTOR")
    # Titulares de esos grupos
    users = users | User.objects.filter(role="MAESTRO_TITULAR", school_id=event.school_id, id__in=Group.objects.filter(id__in=group_ids).values("homeroom_teacher_id"))
    # Itinerantes asignados
    from core.models import SpecialistAssignment
    users = users | User.objects.filter(id__in=SpecialistAssignment.objects.filter(group_id__in=group_ids).values("teacher_id"))
    # Vocales activos
    users = users | User.objects.filter(id__in=VocalAssignment.objects.filter(group_id__in=group_ids, active=True).values("parent_id"))
    # Padres del grupo
    student_ids = ParentStudent.objects.filter(parent__school_id=event.school_id).values_list("student_id", flat=True)
    parent_ids = ParentStudent.objects.filter(student_id__in=GroupMembership.objects.filter(group_id__in=group_ids).values("student_id")).values("parent_id")
    users = users | User.objects.filter(id__in=parent_ids)
    return users.distinct()

@shared_task
def send_event_reminders():
    now = timezone.now()
    soon = now + timedelta(hours=getattr(settings, "EVENT_REMINDER_HOURS_AHEAD", 24))
    events = Event.objects.filter(status="ACTIVE", start_at__range=(now, soon))
    total = 0
    for ev in events:
        users = event_audience_users(ev)
        notify_users(users, f"Recordatorio: {ev.title}", f"Empieza el {ev.start_at}")
        total += users.count()
    return {"events": events.count(), "notifications": total}

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
    for s in surveys:
        # audiencias similares a event_audience_users si es GROUP; si es SCHOOL, todos en la escuela
        from core.models import User, GroupMembership, ParentStudent, SpecialistAssignment, VocalAssignment
        if s.scope == "SCHOOL":
            users = User.objects.filter(school_id=s.school_id, is_active=True)
        else:
            g = s.group
            users = User.objects.filter(role="DIRECTOR", school_id=s.school_id)
            users = users | User.objects.filter(role="MAESTRO_TITULAR", id=g.homeroom_teacher_id)
            users = users | User.objects.filter(id__in=SpecialistAssignment.objects.filter(group=g).values("teacher_id"))
            users = users | User.objects.filter(id__in=VocalAssignment.objects.filter(group=g, active=True).values("parent_id"))
            parent_ids = ParentStudent.objects.filter(student_id__in=GroupMembership.objects.filter(group=g).values("student_id")).values("parent_id")
            users = users | User.objects.filter(id__in=parent_ids)
            users = users.distinct()
        notify_users(users, f"Encuesta por cerrar: {s.title}", f"Cierra el {s.end_at}")
    return surveys.count()
