import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta

from core.models import (
    School,
    SchoolYear,
    Group,
    User,
    Event,
    EventGroupAudience,
)


@pytest.mark.django_db
def test_events_ics_requires_authentication():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
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
    Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    client = APIClient()
    res = client.get("/api/v1/events/ics/", HTTP_X_SCHOOL_ID=str(school.id))
    assert res.status_code == 401


@pytest.mark.django_db
def test_events_ics_requires_school_header():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
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
    Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    token = str(RefreshToken.for_user(teacher).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    res = client.get("/api/v1/events/ics/")
    assert res.status_code == 400


@pytest.mark.django_db
def test_events_ics_filters_events_by_user():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    teacher1 = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    teacher2 = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher1,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G2",
        grade_level=1,
        homeroom_teacher=teacher2,
    )
    now = timezone.now()
    # Global event
    Event.objects.create(
        school=school,
        school_year=sy,
        scope="GLOBAL",
        title="Global",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher1,
    )
    # Event for group1
    e1 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="G1 Event",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher1,
    )
    EventGroupAudience.objects.create(event=e1, group=group1)
    # Event for group2
    e2 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="G2 Event",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher2,
    )
    EventGroupAudience.objects.create(event=e2, group=group2)

    token = str(RefreshToken.for_user(teacher1).access_token)
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get("/api/v1/events/ics/")
    assert res.status_code == 200
    content = res.content.decode()
    assert "SUMMARY:Global" in content
    assert "SUMMARY:G1 Event" in content
    assert "SUMMARY:G2 Event" not in content


@pytest.mark.django_db
def test_events_ics_rejects_other_school_events():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    sy1 = SchoolYear.objects.create(
        school=school1,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    teacher1 = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school1,
    )
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy2 = SchoolYear.objects.create(
        school=school2,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    teacher2 = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school2,
    )
    Event.objects.create(
        school=school2,
        school_year=sy2,
        scope="GLOBAL",
        title="Other",
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(hours=1),
        created_by=teacher2,
    )
    token = str(RefreshToken.for_user(teacher1).access_token)
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id)
    )
    res = client.get("/api/v1/events/ics/")
    assert res.status_code == 200
    assert b"SUMMARY:Other" not in res.content
