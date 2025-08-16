import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from core.models import (
    School,
    SchoolYear,
    User,
    Student,
    Group,
    GroupMembership,
    VocalAssignment,
    ParentStudent,
)


@pytest.fixture
def school_and_years(db):
    school = School.objects.create(name="S", slug="s", subdomain="s")
    from_year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date="2023-08-01",
        end_date="2024-07-01",
    )
    to_year = SchoolYear.objects.create(
        school=school,
        name="2024",
        start_date="2024-08-01",
        end_date="2025-07-01",
    )
    teacher = User.objects.create(
        username="t",
        email="t@example.com",
        role="MAESTRO_TITULAR",
        school=school,
    )
    parent = User.objects.create(
        username="p",
        email="p@example.com",
        role="PADRE",
        school=school,
    )
    student = Student.objects.create(
        school=school,
        first_name="A",
        last_name="S",
        grade_level=1,
        enrollment_code="1",
    )
    group = Group.objects.create(
        school=school,
        school_year=from_year,
        name="1A",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="parent"
    )
    VocalAssignment.objects.create(
        school=school, group=group, parent=parent, assigned_by=teacher
    )
    return school, from_year, to_year, teacher, parent, student, group


def test_rollover_creates_groups_and_vocals(school_and_years):
    school, from_year, to_year, teacher, parent, student, group = school_and_years

    call_command(
        "rollover_school_year",
        from_year.id,
        to_year.id,
        "--confirm",
    )

    new_group = Group.objects.get(school_year=to_year, name=group.name)
    assert new_group.homeroom_teacher == teacher
    assert VocalAssignment.objects.filter(group=new_group, parent=parent).exists()
    # parent-student relation shouldn't duplicate
    assert ParentStudent.objects.count() == 1


def test_rollover_dry_run_does_not_persist(school_and_years):
    school, from_year, to_year, *_ = school_and_years
    call_command(
        "rollover_school_year",
        from_year.id,
        to_year.id,
        "--confirm",
        "--dry-run",
    )
    assert not Group.objects.filter(school_year=to_year).exists()


def test_rollover_detects_duplicate_group(school_and_years):
    school, from_year, to_year, *_ = school_and_years
    Group.objects.create(
        school=school, school_year=to_year, name="1A", grade_level=1
    )
    with pytest.raises(CommandError):
        call_command(
            "rollover_school_year",
            from_year.id,
            to_year.id,
            "--confirm",
        )
