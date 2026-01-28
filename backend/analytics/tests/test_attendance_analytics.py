import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    User,
    Group,
    Student,
    GroupMembership,
    ParentStudent,
    Event,
    EventGroupAudience,
    EventRSVP,
)


@pytest.mark.django_db
def test_attendance_analytics_counts_and_rates():
    school = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school_year = SchoolYear.objects.create(
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
    parent1 = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    parent2 = User.objects.create_user(
        username="p2@x.com",
        email="p2@x.com",
        password="p",
        role="PADRE",
        school=school,
    )

    group = Group.objects.create(
        school=school,
        school_year=school_year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    student1 = Student.objects.create(
        school=school,
        first_name="A",
        last_name="B",
        grade_level=1,
        enrollment_code="E1",
    )
    student2 = Student.objects.create(
        school=school,
        first_name="C",
        last_name="D",
        grade_level=1,
        enrollment_code="E2",
    )
    GroupMembership.objects.create(group=group, student=student1, school_id=school.id)
    GroupMembership.objects.create(group=group, student=student2, school_id=school.id)
    ParentStudent.objects.create(
        school_id=school.id,
        parent=parent1,
        student=student1,
        relationship="parent",
    )
    ParentStudent.objects.create(
        school_id=school.id,
        parent=parent2,
        student=student2,
        relationship="parent",
    )

    start = timezone.now() + timedelta(days=1)
    end = start + timedelta(hours=2)
    event = Event.objects.create(
        school=school,
        school_year=school_year,
        scope=Event.Scope.GROUP,
        title="Evento",
        description="",
        location="",
        start_at=start,
        end_at=end,
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event, group=group)

    EventRSVP.objects.create(event=event, user=parent1, status=EventRSVP.Status.YES)
    EventRSVP.objects.create(event=event, user=parent2, status=EventRSVP.Status.NO)

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    from_date = (timezone.now() - timedelta(days=1)).date().isoformat()
    to_date = (timezone.now() + timedelta(days=2)).date().isoformat()
    res = client.get(
        f"/api/v1/analytics/events/attendance/?from={from_date}&to={to_date}"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["attending_yes"] == 1
    assert data["attending_no"] == 1
    assert data["attending_maybe"] == 0
    assert data["participation_rate"] == 0.5
    assert data["attendance_by_group"][0]["group_id"] == group.id
    assert data["attendance_by_group"][0]["attending_yes"] == 1
    assert data["attendance_by_group"][0]["participation_rate"] == 0.5


@pytest.mark.django_db
def test_attendance_analytics_requires_director():
    school = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school_year = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get("/api/v1/analytics/events/attendance/")
    assert res.status_code == 403
