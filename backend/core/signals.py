from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import (
    Complaint,
    ComplaintMessage,
    Homework,
    GroupMembership,
    ParentStudent,
    User,
)
from django.conf import settings
from notifications.tasks import push_to_users

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
        kind="homework",
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)
