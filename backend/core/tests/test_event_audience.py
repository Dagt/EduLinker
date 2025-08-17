import pytest
from django.utils import timezone
from datetime import date, timedelta

from core.utils import get_event_audience_user_ids
from core.models import (
    School,
    SchoolYear,
    Group,
    Event,
    EventGroupAudience,
    User,
    Student,
    SpecialistAssignment,
    VocalAssignment,
    GroupMembership,
    ParentStudent,
)


@pytest.mark.django_db
def test_event_audience_excludes_other_school_users():
    s1 = School.objects.create(name="S1", slug="s1", subdomain="s1")
    s2 = School.objects.create(name="S2", slug="s2", subdomain="s2")

    y1 = SchoolYear.objects.create(
        school=s1,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )
    y2 = SchoolYear.objects.create(
        school=s2,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )

    director1 = User.objects.create(
        username="dir1",
        school=s1,
        role="DIRECTOR",
        email="dir1@example.com",
    )
    director2 = User.objects.create(
        username="dir2",
        school=s2,
        role="DIRECTOR",
        email="dir2@example.com",
    )

    homeroom = User.objects.create(
        username="home",
        school=s1,
        role="MAESTRO_TITULAR",
        email="home@example.com",
    )

    group1 = Group.objects.create(
        school=s1,
        school_year=y1,
        name="G1",
        grade_level=1,
        homeroom_teacher=homeroom,
    )

    event = Event.objects.create(
        school=s1,
        school_year=y1,
        scope="GROUP",
        title="E1",
        description="",
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(hours=1),
        created_by=director1,
    )
    EventGroupAudience.objects.create(event=event, group=group1)

    specialist1 = User.objects.create(
        username="spec1",
        school=s1,
        role="MAESTRO_ITINERANTE",
        email="spec1@example.com",
    )
    specialist2 = User.objects.create(
        username="spec2",
        school=s2,
        role="MAESTRO_ITINERANTE",
        email="spec2@example.com",
    )
    SpecialistAssignment.objects.create(
        school=s1, group=group1, teacher=specialist1, subject="Math"
    )
    SpecialistAssignment.objects.create(
        school=s2, group=group1, teacher=specialist2, subject="Science"
    )

    parent1 = User.objects.create(
        username="p1",
        school=s1,
        role="PADRE",
        email="p1@example.com",
    )
    parent2 = User.objects.create(
        username="p2",
        school=s2,
        role="PADRE",
        email="p2@example.com",
    )
    parent3 = User.objects.create(
        username="p3",
        school=s2,
        role="PADRE",
        email="p3@example.com",
    )

    VocalAssignment.objects.create(
        school=s1, group=group1, parent=parent1, assigned_by=director1
    )
    VocalAssignment.objects.create(
        school=s2, group=group1, parent=parent2, assigned_by=director2
    )

    student1 = Student.objects.create(
        school=s1,
        first_name="A",
        last_name="S",
        grade_level=1,
        enrollment_code="s1",
    )
    student2 = Student.objects.create(
        school=s2,
        first_name="B",
        last_name="S",
        grade_level=1,
        enrollment_code="s2",
    )

    GroupMembership.objects.create(school=s1, group=group1, student=student1)
    GroupMembership.objects.create(school=s2, group=group1, student=student2)

    ParentStudent.objects.create(
        school=s1, parent=parent1, student=student1, relationship="parent"
    )
    ParentStudent.objects.create(
        school=s2, parent=parent2, student=student1, relationship="parent"
    )
    ParentStudent.objects.create(
        school=s2, parent=parent3, student=student2, relationship="parent"
    )

    ids = get_event_audience_user_ids(event)

    assert parent1.id in ids
    assert specialist1.id in ids
    assert parent2.id not in ids
    assert parent3.id not in ids
    assert specialist2.id not in ids
