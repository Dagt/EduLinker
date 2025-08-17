import pytest
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, Group, User, Event, EventGroupAudience


@pytest.mark.django_db
def test_events_analytics_filters_and_aggregation():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    group1 = Group.objects.create(school=school, school_year=sy, name="G1", grade_level=1)
    group2 = Group.objects.create(school=school, school_year=sy, name="G2", grade_level=1)

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

    t1 = make_aware(datetime(2025, 1, 6, 10, 0))
    t2 = make_aware(datetime(2025, 1, 7, 10, 0))
    t3 = make_aware(datetime(2025, 2, 3, 10, 0))
    t4 = make_aware(datetime(2025, 2, 17, 10, 0))

    e1 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E1",
        description="",
        location="",
        start_at=t1,
        end_at=t1 + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=e1, group=group1)

    Event.objects.create(
        school=school,
        school_year=sy,
        scope="GLOBAL",
        title="E2",
        description="",
        location="",
        start_at=t2,
        end_at=t2 + timedelta(hours=1),
        created_by=teacher,
    )

    e3 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E3",
        description="",
        location="",
        start_at=t3,
        end_at=t3 + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=e3, group=group1)

    e4 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E4",
        description="",
        location="",
        start_at=t4,
        end_at=t4 + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=e4, group=group2)

    token = str(RefreshToken.for_user(director).access_token)
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get("/api/v1/analytics/events/")
    assert res.status_code == 200
    data = res.json()
    assert sum(item["total"] for item in data["events_by_day"]) == 4
    months = {item["month"]: item["total"] for item in data["events_by_month"]}
    assert months["2025-01-01"] == 2
    assert months["2025-02-01"] == 2
    groups = {item["group_id"]: item["total"] for item in data["events_by_group"]}
    assert groups[group1.id] == 2
    assert groups[group2.id] == 1

    res = client.get(f"/api/v1/analytics/events/?group_id={group1.id}")
    data = res.json()
    assert sum(item["total"] for item in data["events_by_day"]) == 2
    assert data["events_by_group"][0]["group_id"] == group1.id
    assert data["events_by_group"][0]["total"] == 2

    res = client.get("/api/v1/analytics/events/?scope=GLOBAL")
    data = res.json()
    assert sum(item["total"] for item in data["events_by_day"]) == 1
    assert data["events_by_group"] == []

    res = client.get("/api/v1/analytics/events/?from=2025-02-01&to=2025-02-10")
    data = res.json()
    assert len(data["events_by_day"]) == 1
    assert data["events_by_day"][0]["date"] == "2025-02-03"
    assert data["events_by_group"][0]["group_id"] == group1.id
    assert data["events_by_group"][0]["total"] == 1


@pytest.mark.django_db
def test_events_analytics_requires_director_role():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    group1 = Group.objects.create(school=school, school_year=sy, name="G1", grade_level=1)
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    t = make_aware(datetime(2025, 1, 6, 10, 0))
    e = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E",
        description="",
        location="",
        start_at=t,
        end_at=t + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=e, group=group1)

    token = str(RefreshToken.for_user(teacher).access_token)
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get("/api/v1/analytics/events/")
    assert res.status_code == 403
