from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models import User
from core.utils import get_group_audience_user_ids
from notifications.models import NotificationPreference
from notifications.tasks import push_to_users, _filter_user_ids_by_pref

from .models import Survey


@receiver(post_save, sender=Survey)
def notify_new_survey(sender, instance: Survey, created, **kwargs):
    if not created:
        return

    if instance.scope == Survey.Scope.SCHOOL:
        user_ids = list(
            User.objects.filter(
                school_id=instance.school_id, is_active=True
            ).values_list("id", flat=True)
        )
    else:
        user_ids = get_group_audience_user_ids(instance.school_id, [instance.group_id])

    # Exclude creator
    if instance.created_by_id in user_ids:
        user_ids = [uid for uid in user_ids if uid != instance.created_by_id]

    # Respect notification preferences
    user_ids = _filter_user_ids_by_pref(
        instance.school_id, user_ids, NotificationPreference.Kind.SURVEY
    )
    if not user_ids:
        return

    params = dict(
        school_id=instance.school_id,
        user_ids=user_ids,
        title="Nueva encuesta",
        body=instance.title[:80],
        data={"type": "survey", "survey_id": instance.id},
        kind="survey",
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)
