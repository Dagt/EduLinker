import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    Group,
    Event,
    EventGroupAudience,
    User,
    Student,
    GroupMembership,
    ParentStudent,
    EventRSVP,
)


def _setup_env():
    school = School.objects.create(name="S", slug="s", subdomain="s")
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
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
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G2",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    student = Student.objects.create(
        school=school,
        first_name="A",
        last_name="B",
        grade_level=1,
        enrollment_code="1",
    )
    GroupMembership.objects.create(school=school, group=group1, student=student)
    ParentStudent.objects.create(school=school, parent=parent, student=student, relationship="F")
    now = timezone.now()
    event1 = Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GROUP,
        title="E1",
        start_at=now + timedelta(hours=1),
        end_at=now + timedelta(hours=2),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event1, group=group1)
    event2 = Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GROUP,
        title="E2",
        start_at=now + timedelta(hours=1),
        end_at=now + timedelta(hours=2),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event2, group=group2)
    return school, parent, event1, event2


def _client(user, school):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    return client


@pytest.mark.django_db
def test_create_and_get_rsvp():
    school, parent, event1, _ = _setup_env()
    client = _client(parent, school)
    res = client.post(f"/api/v1/events/{event1.id}/rsvp/", {"status": "YES"}, format="json")
    assert res.status_code == 200
    assert res.json()["status"] == "YES"
    assert EventRSVP.objects.filter(event=event1, user=parent, status="YES").exists()
    res = client.get(f"/api/v1/events/{event1.id}/rsvp/")
    assert res.status_code == 200
    assert res.json()["status"] == "YES"


@pytest.mark.django_db
def test_update_rsvp():
    school, parent, event1, _ = _setup_env()
    EventRSVP.objects.create(event=event1, user=parent, status="YES")
    client = _client(parent, school)
    res = client.post(f"/api/v1/events/{event1.id}/rsvp/", {"status": "MAYBE"}, format="json")
    assert res.status_code == 200
    assert res.json()["status"] == "MAYBE"
    assert EventRSVP.objects.filter(event=event1, user=parent, status="MAYBE").exists()


@pytest.mark.django_db
def test_rsvp_permission_denied():
    school, parent, _, event2 = _setup_env()
    client = _client(parent, school)
    res = client.post(f"/api/v1/events/{event2.id}/rsvp/", {"status": "YES"}, format="json")
    assert res.status_code == 403
