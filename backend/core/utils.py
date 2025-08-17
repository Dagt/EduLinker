from core.models import (
    User,
    Group,
    GroupMembership,
    ParentStudent,
    SpecialistAssignment,
    VocalAssignment,
)


def get_group_audience_user_ids(school_id, group_ids):
    """Return user IDs for directors, teachers and parents of given groups."""
    ids = set()
    ids.update(
        User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True)
    )
    ids.update(
        User.objects.filter(
            role="MAESTRO_TITULAR",
            school_id=school_id,
            id__in=Group.objects.filter(id__in=group_ids).values("homeroom_teacher_id"),
        ).values_list("id", flat=True)
    )
    ids.update(
        SpecialistAssignment.objects.filter(
            group_id__in=group_ids, school_id=school_id
        ).values_list("teacher_id", flat=True)
    )
    ids.update(
        VocalAssignment.objects.filter(
            group_id__in=group_ids, active=True, school_id=school_id
        ).values_list("parent_id", flat=True)
    )
    student_ids = GroupMembership.objects.filter(
        group_id__in=group_ids, school_id=school_id
    ).values("student_id")
    parent_ids = ParentStudent.objects.filter(
        student_id__in=student_ids, school_id=school_id
    ).values_list("parent_id", flat=True)
    ids.update(parent_ids)
    return [uid for uid in ids if uid]


def get_event_audience_user_ids(event):
    if event.scope == "GLOBAL":
        return list(
            User.objects.filter(school_id=event.school_id, is_active=True).values_list("id", flat=True)
        )
    group_ids = list(event.group_audiences.values_list("group_id", flat=True))
    return get_group_audience_user_ids(event.school_id, group_ids)
