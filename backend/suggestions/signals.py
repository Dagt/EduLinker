from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models import User
from notifications.tasks import push_to_users

from .models import Suggestion, SuggestionMessage


def _director_ids(school_id: int) -> list[int]:
    """Return IDs of directors for a given school."""
    return list(
        User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True)
    )


@receiver(post_save, sender=Suggestion)
def notify_new_suggestion(sender, instance: Suggestion, created, **kwargs):
    if not created:
        return
    school_id = instance.school_id
    targets = set(_director_ids(school_id))
    if instance.target_teacher_id:
        targets.add(instance.target_teacher_id)
    targets.add(instance.created_by_id)
    if instance.created_by_id in targets:
        targets.remove(instance.created_by_id)
    if not targets:
        return
    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Nueva sugerencia",
        body=instance.description[:80],
        data={"type": "suggestion", "suggestion_id": instance.id},
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)


@receiver(post_save, sender=SuggestionMessage)
def notify_new_suggestion_message(sender, instance: SuggestionMessage, created, **kwargs):
    if not created:
        return
    s = instance.suggestion
    school_id = s.school_id
    targets = set(_director_ids(school_id))
    if s.target_teacher_id:
        targets.add(s.target_teacher_id)
    targets.add(s.created_by_id)
    if instance.author_id in targets:
        targets.remove(instance.author_id)
    if not targets:
        return
    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Nuevo mensaje en sugerencia",
        body=instance.message[:80],
        data={"type": "suggestion_message", "suggestion_id": s.id},
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)
