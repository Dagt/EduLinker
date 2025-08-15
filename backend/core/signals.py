from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import Complaint, ComplaintMessage, User
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
