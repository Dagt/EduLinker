import pytest
from django.utils import timezone

from core.models import School, SchoolYear, User, Group, Event, Complaint
from core.permissions import (
    can_view_event,
    can_post_activity_photo,
    CanAccessComplaint,
)
from core.roles import Roles


@pytest.mark.django_db
def test_admin_tenant_can_view_event_across_schools():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy = SchoolYear.objects.create(
        school=school1,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    creator = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role=Roles.DIRECTOR,
        school=school1,
    )
    event = Event.objects.create(
        school=school1,
        school_year=sy,
        scope=Event.Scope.GLOBAL,
        title="X",
        start_at=timezone.now(),
        end_at=timezone.now() + timezone.timedelta(hours=1),
        created_by=creator,
    )
    admin = User.objects.create_user(
        username="a@x.com",
        email="a@x.com",
        password="p",
        role=Roles.ADMIN_TENANT,
        school=school2,
    )

    assert can_view_event(admin, event)


@pytest.mark.django_db
def test_admin_tenant_can_post_activity_photo():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy = SchoolYear.objects.create(
        school=school1,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role=Roles.MAESTRO_TITULAR,
        school=school1,
    )
    group = Group.objects.create(
        school=school1,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    admin = User.objects.create_user(
        username="admin@x.com",
        email="admin@x.com",
        password="p",
        role=Roles.ADMIN_TENANT,
        school=school2,
    )

    assert can_post_activity_photo(admin, group)


@pytest.mark.django_db
def test_admin_tenant_can_access_complaint():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy = SchoolYear.objects.create(
        school=school1,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role=Roles.MAESTRO_TITULAR,
        school=school1,
    )
    group = Group.objects.create(
        school=school1,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role=Roles.PADRE,
        school=school1,
    )
    complaint = Complaint.objects.create(
        school=school1,
        group=group,
        created_by=parent,
        target_teacher=teacher,
        description="X",
    )
    admin = User.objects.create_user(
        username="admin@x.com",
        email="admin2@x.com",
        password="p",
        role=Roles.ADMIN_TENANT,
        school=school2,
    )
    perm = CanAccessComplaint()
    request = type("obj", (), {"user": admin})()

    assert perm.has_object_permission(request, None, complaint)
