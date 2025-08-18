from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models import User
from notifications.models import NotificationPreference
from notifications.tasks import push_to_users

from .models import ExpenseEvidence, FundraisingGroupLedger


def _director_ids(school_id: int) -> list[int]:
    return list(
        User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True)
    )


@receiver(post_save, sender=FundraisingGroupLedger)
def notify_new_ledger(sender, instance: FundraisingGroupLedger, created, **kwargs):
    if not created:
        return
    school_id = instance.event.school_id
    targets = set(_director_ids(school_id))
    teacher_id = instance.group.homeroom_teacher_id
    if teacher_id:
        targets.add(teacher_id)
    if instance.created_by_id in targets:
        targets.remove(instance.created_by_id)
    if not targets:
        return
    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Nuevo registro de recaudación",
        body=str(instance.amount_collected),
        data={"event_id": instance.event_id},
        kind=NotificationPreference.Kind.FUNDRAISING,
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)


@receiver(post_save, sender=ExpenseEvidence)
def notify_new_expense_evidence(sender, instance: ExpenseEvidence, created, **kwargs):
    if not created:
        return
    ledger = instance.ledger
    if not ledger:
        return
    school_id = ledger.event.school_id
    targets = set(_director_ids(school_id))
    group = instance.group or ledger.group
    teacher_id = group.homeroom_teacher_id if group else None
    if teacher_id:
        targets.add(teacher_id)
    if instance.uploader_id in targets:
        targets.remove(instance.uploader_id)
    if not targets:
        return
    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Nuevo gasto registrado",
        body=instance.concept[:80],
        data={"event_id": ledger.event_id},
        kind=NotificationPreference.Kind.FUNDRAISING,
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)
