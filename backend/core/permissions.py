"""Permission helpers and classes for core app."""

from rest_framework.permissions import BasePermission

from .models import (
    User,
    Event,
    Group,
    SpecialistAssignment,
    VocalAssignment,
    GroupMembership,
    ParentStudent,
    ComplaintParticipant,
)
from .roles import Roles


# ---------------------------------------------------------------------------
# Role helper predicates
# ---------------------------------------------------------------------------


def is_admin_tenant(user: User) -> bool:
    return user.role == Roles.ADMIN_TENANT


def is_director(user: User) -> bool:
    return user.role == Roles.DIRECTOR


def is_maestro_titular(user: User) -> bool:
    return user.role == Roles.MAESTRO_TITULAR


def is_maestro_itinerante(user: User) -> bool:
    return user.role == Roles.MAESTRO_ITINERANTE


def is_vocal(user: User) -> bool:
    return user.role == Roles.VOCAL


def is_padre(user: User) -> bool:
    return user.role == Roles.PADRE


def can_view_event(user: User, event: Event) -> bool:
    """Return True if user can view the given event."""
    if is_admin_tenant(user):
        return True

    if user.school_id != event.school_id:
        return False

    if event.scope == Event.Scope.GLOBAL:
        return True

    group_ids = event.group_audiences.values_list("group_id", flat=True)

    if is_director(user):
        return True

    if is_maestro_titular(user):
        return Group.objects.filter(
            id__in=group_ids, homeroom_teacher_id=user.id
        ).exists()

    if is_maestro_itinerante(user):
        return SpecialistAssignment.objects.filter(
            group_id__in=group_ids, teacher_id=user.id
        ).exists()

    if is_vocal(user):
        return VocalAssignment.objects.filter(
            group_id__in=group_ids, parent_id=user.id, active=True
        ).exists()

    if is_padre(user):
        student_ids = ParentStudent.objects.filter(parent_id=user.id).values_list(
            "student_id", flat=True
        )
        return GroupMembership.objects.filter(
            group_id__in=group_ids, student_id__in=student_ids
        ).exists()

    return False


def can_post_activity_photo(user: User, group: Group) -> bool:
    """Return True if user may upload an activity photo for the group."""
    if is_admin_tenant(user):
        return True

    if user.school_id != group.school_id:
        return False

    if is_maestro_titular(user) and group.homeroom_teacher_id == user.id:
        return True

    if is_maestro_itinerante(user) and SpecialistAssignment.objects.filter(
        group=group, teacher=user
    ).exists():
        return True

    if is_vocal(user) and VocalAssignment.objects.filter(
        group=group, parent=user, active=True
    ).exists():
        return True

    return False


# ---------------------------------------------------------------------------
# Object permissions
# ---------------------------------------------------------------------------


class IsSelf(BasePermission):
    """Allow access only to the object's user."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user


class CanAccessComplaint(BasePermission):
    """Allow access to private complaints for authorized participants."""

    def has_object_permission(self, request, view, obj):
        user = request.user

        if is_admin_tenant(user):
            return True

        if user.school_id != obj.school_id:
            return False

        if user == obj.created_by or user == obj.target_teacher:
            return True

        if is_director(user):
            return True

        if ComplaintParticipant.objects.filter(
            complaint=obj, user=user
        ).exists():
            return True

        return False

