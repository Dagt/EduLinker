"""Permission helpers and classes for core app."""

from django.db.models import Q
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
from suggestions.models import Suggestion


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


def user_can_view_event(user: User):
    """Return a Q filter to limit events visible to ``user``."""
    if is_admin_tenant(user) or is_director(user):
        return Q()

    if is_maestro_titular(user):
        group_ids = Group.objects.filter(homeroom_teacher_id=user.id).values_list(
            "id", flat=True
        )
    elif is_maestro_itinerante(user):
        group_ids = SpecialistAssignment.objects.filter(teacher_id=user.id).values_list(
            "group_id", flat=True
        )
    elif is_vocal(user):
        group_ids = VocalAssignment.objects.filter(
            parent_id=user.id, active=True
        ).values_list("group_id", flat=True)
    elif is_padre(user):
        student_ids = ParentStudent.objects.filter(parent_id=user.id).values_list(
            "student_id", flat=True
        )
        group_ids = GroupMembership.objects.filter(
            student_id__in=student_ids
        ).values_list("group_id", flat=True)
    else:
        group_ids = Group.objects.none().values_list("id", flat=True)

    return Q(scope=Event.Scope.GLOBAL) | Q(group_audiences__group_id__in=group_ids)


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
# Action helper predicates
# ---------------------------------------------------------------------------


def can_view_chat(user: User, group: Group) -> bool:
    """Return True if user may view the chat for the given group."""
    if is_admin_tenant(user):
        return True
    if user.school_id != group.school_id:
        return False
    if is_director(user):
        return True
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
    if is_padre(user):
        student_ids = ParentStudent.objects.filter(parent=user).values_list(
            "student_id", flat=True
        )
        return GroupMembership.objects.filter(
            group=group, student_id__in=student_ids
        ).exists()
    return False


def can_post_chat(user: User, group: Group) -> bool:
    """Return True if user may post in the chat for the group."""
    if not can_view_chat(user, group):
        return False
    if is_director(user) or is_admin_tenant(user):
        return False
    return True


def can_create_suggestion(user: User) -> bool:
    """Return True if user can create a suggestion."""
    return is_padre(user) or is_vocal(user) or is_maestro_titular(user)


def can_update_suggestion_status(user: User, suggestion: Suggestion) -> bool:
    """Return True if user may update the suggestion's status."""
    return is_admin_tenant(user) or is_director(user) or user == suggestion.target_teacher


def can_record_fundraising_ledger(user: User, group: Group) -> bool:
    """Return True if user may record a fundraising ledger for the group."""
    if is_admin_tenant(user):
        return True
    if user.school_id != group.school_id:
        return False
    if is_director(user):
        return True
    if is_maestro_titular(user) and group.homeroom_teacher_id == user.id:
        return True
    if is_vocal(user) and VocalAssignment.objects.filter(
        group=group, parent=user, active=True
    ).exists():
        return True
    return False


def can_upload_expense(user: User, group: Group) -> bool:
    """Return True if user may upload an expense for the group."""
    return is_vocal(user) and VocalAssignment.objects.filter(
        group=group, parent=user, active=True
    ).exists()


# ---------------------------------------------------------------------------
# Permission classes
# ---------------------------------------------------------------------------


class IsDirector(BasePermission):
    """Allow access only to director users."""

    def has_permission(self, request, view):
        user = request.user
        return is_director(user) or is_admin_tenant(user)


class CanAccessSuggestion(BasePermission):
    """Allow authorized users to access a suggestion instance."""

    def has_object_permission(self, request, view, obj: Suggestion):
        user = request.user
        if is_admin_tenant(user):
            return True
        if user.school_id != obj.school_id:
            return False
        if is_director(user) or user == obj.created_by or user == obj.target_teacher:
            return True
        if (
            obj.group
            and is_maestro_titular(user)
            and obj.group.homeroom_teacher_id == user.id
        ):
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

        if user.school_id != obj.school_id:
            return False

        if user == obj.created_by or user == obj.target_teacher:
            return True

        if is_director(user) or is_admin_tenant(user):
            return True

        if ComplaintParticipant.objects.filter(
            complaint=obj, user=user
        ).exists():
            return True

        return False

