from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from chat.models import ChatMessage
from core.models import GroupMembership, ParentStudent, VocalAssignment
from notifications.models import NotificationPreference
from notifications.tasks import push_to_users


@receiver(post_save, sender=ChatMessage)
def notify_new_chat_message(sender, instance: ChatMessage, created, **kwargs):
    if not created:
        return

    group = instance.chat.group
    school_id = group.school_id

    student_ids = GroupMembership.objects.filter(
        group_id=group.id, school_id=school_id
    ).values_list("student_id", flat=True)
    parent_ids = ParentStudent.objects.filter(
        student_id__in=student_ids, school_id=school_id
    ).values_list("parent_id", flat=True)

    teacher_id = group.homeroom_teacher_id
    vocal_ids = VocalAssignment.objects.filter(
        group_id=group.id, school_id=school_id, active=True
    ).values_list("parent_id", flat=True)

    targets = set(parent_ids) | set(vocal_ids)
    if teacher_id:
        targets.add(teacher_id)
    if instance.author_id in targets:
        targets.remove(instance.author_id)
    if not targets:
        return

    params = dict(
        school_id=school_id,
        user_ids=list(targets),
        title="Nuevo mensaje en chat",
        body=(instance.message_text or "")[:80],
        data={"type": "chat_message", "chat_id": instance.chat_id},
        kind=NotificationPreference.Kind.PUSH,
    )
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        push_to_users(**params)
    else:
        push_to_users.delay(**params)
