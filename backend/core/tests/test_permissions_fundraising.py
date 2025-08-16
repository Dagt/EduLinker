import pytest

from core.models import School, SchoolYear, Group, User, VocalAssignment
from core.permissions import can_record_fundraising_ledger


@pytest.mark.django_db
def test_can_record_fundraising_ledger_roles():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    other_teacher = User.objects.create_user(
        username="o@x.com",
        email="o@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="VOCAL",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    VocalAssignment.objects.create(
        school=school, group=group, parent=parent, assigned_by=teacher, active=True
    )

    assert can_record_fundraising_ledger(director, group)
    assert can_record_fundraising_ledger(teacher, group)
    assert can_record_fundraising_ledger(parent, group)
    assert not can_record_fundraising_ledger(other_teacher, group)

