from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings

from core.models import (
    Announcement,
    Event,
    Complaint,
    ComplaintMessage,
    ComplaintParticipant,
    Group,
    GroupMembership,
    Homework,
    ParentStudent,
    User,
)
from core.utils import get_group_audience_user_ids, get_event_audience_user_ids
from notifications.tasks import push_to_users
from notifications.models import NotificationPreference

def _director_ids(school_id):
    return list(User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True))

@receiver(post_save, sender=Complaint)
def notify_new_complaint(sender, instance: Complaint, created, **kwargs):
    if not created:
        return
    school_id = instance.school_id
    # Destinatarios: maestro objetivo + directores (en copia)
    user_ids = [instance.target_teacher_id] + _director_ids(school_id)
    params = dict(
        school_id=school_id,
        user_ids=user_ids,
        title="Nueva queja",
        body=f"Queja #{instance.id}: {instance.description[:80]}",
        data={"type": "complaint", "complaint_id": instance.id}
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)

@receiver(post_save, sender=ComplaintMessage)
def notify_new_complaint_message(sender, instance: ComplaintMessage, created, **kwargs):
    if not created:
        return
    c = instance.complaint
    school_id = c.school_id
    # Destinatarios: creador y maestro objetivo y directores (excluir autor del mensaje)
    targets = set([c.created_by_id, c.target_teacher_id] + _director_ids(school_id))
    if instance.author_id in targets: targets.remove(instance.author_id)
    if targets:
        params = dict(
            school_id=school_id,
            user_ids=list(targets),
            title="Nuevo mensaje en queja",
            body=instance.message[:80],
            data={"type": "complaint_message", "complaint_id": c.id}
        )
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            push_to_users(**params)
        else:
            push_to_users.delay(**params)


@receiver(pre_save, sender=Complaint)
def track_complaint_prev_status(sender, instance: Complaint, **kwargs):
    if instance.pk:
        try:
            instance._prev_status = sender.objects.only("status").get(pk=instance.pk).status
        except sender.DoesNotExist:
            instance._prev_status = None


@receiver(post_save, sender=Complaint)
def notify_complaint_status_change(sender, instance: Complaint, created, **kwargs):
    if created:
        return
    prev_status = getattr(instance, "_prev_status", None)
    if prev_status is None or prev_status == instance.status:
        return
    actor_id = getattr(instance, "_actor_id", None)
    school_id = instance.school_id
    targets = {instance.created_by_id, instance.target_teacher_id}
    targets.update(_director_ids(school_id))
    targets.update(instance.participants.values_list("user_id", flat=True))
    if actor_id in targets:
        targets.remove(actor_id)
    if not targets:
        return
    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Estado de queja actualizado",
        body=f"Queja #{instance.id} ahora está {instance.status}",
        data={
            "type": "complaint_status",
            "complaint_id": instance.id,
            "status": instance.status,
        },
        kind="complaint",
    )
    push_to_users.delay(**params)


@receiver(post_save, sender=ComplaintParticipant)
def notify_new_complaint_participant(sender, instance: ComplaintParticipant, created, **kwargs):
    if not created:
        return
    c = instance.complaint
    school_id = c.school_id
    targets = {c.created_by_id, c.target_teacher_id}
    targets.update(_director_ids(school_id))
    targets.update(c.participants.values_list("user_id", flat=True))
    actor_id = instance.added_by_id
    if actor_id in targets:
        targets.remove(actor_id)
    if not targets:
        return
    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Nuevo participante en queja",
        body=f"Queja #{c.id}",
        data={
            "type": "complaint_participant",
            "complaint_id": c.id,
            "user_id": instance.user_id,
        },
        kind="complaint",
    )
    push_to_users.delay(**params)


@receiver(post_save, sender=Announcement)
def notify_new_announcement(sender, instance: Announcement, created, **kwargs):
    if not created:
        return

    if instance.scope == Announcement.Scope.GLOBAL:
        group_ids = list(
            Group.objects.filter(school_id=instance.school_id).values_list("id", flat=True)
        )
    else:
        group_ids = [instance.group_id]

    user_ids = get_group_audience_user_ids(instance.school_id, group_ids)
    if not user_ids:
        return

    params = dict(
        school_id=instance.school_id,
        user_ids=user_ids,
        title=f"Nuevo anuncio: {instance.title}",
        body=instance.message[:80],
        data={"type": "announcement", "announcement_id": instance.id},
        kind="event",
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)


@receiver(post_save, sender=Event)
def notify_new_event(sender, instance: Event, created, **kwargs):
    if not created:
        return
    user_ids = get_event_audience_user_ids(instance)
    if not user_ids:
        return
    params = dict(
        school_id=instance.school_id,
        user_ids=user_ids,
        title=f"Nuevo evento: {instance.title}",
        body=f"Inicia {instance.start_at:%Y-%m-%d %H:%M}",
        data={"type": "event", "event_id": instance.id},
        kind="event",
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)


@receiver(post_save, sender=Homework)
def notify_new_homework(sender, instance: Homework, created, **kwargs):
    if not created:
        return
    school_id = instance.school_id
    student_ids = GroupMembership.objects.filter(
        group_id=instance.group_id, school_id=school_id
    ).values_list("student_id", flat=True)
    parent_ids = ParentStudent.objects.filter(
        student_id__in=student_ids, school_id=school_id
    ).values_list("parent_id", flat=True)
    targets = set(parent_ids)
    if instance.teacher_id:
        targets.add(instance.teacher_id)
    user_ids = [uid for uid in targets if uid]
    if not user_ids:
        return
    params = dict(
        school_id=school_id,
        user_ids=user_ids,
        title=f"Nueva tarea: {instance.title}",
        body=f"Entrega el {instance.due_date:%Y-%m-%d}",
        data={"homework_id": instance.id},
        kind=NotificationPreference.Kind.HOMEWORK,
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)
