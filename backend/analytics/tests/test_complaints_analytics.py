import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from django.utils import timezone
from core.models import (
    School,
    SchoolYear,
    Group,
    User,
    Complaint,
    Event,
    EventGroupAudience,
)


@pytest.mark.django_db
def test_complaints_analytics_returns_totals():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="1A",
        grade_level=1,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="1B",
        grade_level=1,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    # group1 has two complaints: one open and one resolved
    Complaint.objects.create(
        school=school,
        group=group1,
        created_by=parent,
        target_teacher=teacher,
        description="d1",
        status=Complaint.Status.OPEN,
    )
    Complaint.objects.create(
        school=school,
        group=group1,
        created_by=parent,
        target_teacher=teacher,
        description="d2",
        status=Complaint.Status.RESOLVED,
    )
    # group2 has one resolved complaint
    Complaint.objects.create(
        school=school,
        group=group2,
        created_by=parent,
        target_teacher=teacher,
        description="d3",
        status=Complaint.Status.RESOLVED,
    )

    # events for groups
    now = timezone.now()
    event1 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E1",
        description="",
        location="",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event1, group=group1)
    event2 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E2",
        description="",
        location="",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event2, group=group2)

    token = str(RefreshToken.for_user(director).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get("/api/v1/analytics/complaints/")
    assert res.status_code == 200
    data = res.json()
    assert data["complaints_total"] == 3
    assert data["complaints_open"] == 1
    # group1 has two complaints, group2 has one
    assert data["complaints_by_group"][0]["total"] == 2
    assert data["top_parents_by_complaints"][0]["total"] == 3
    # least problematic group should be group2 with one complaint and high participation
    group_metrics = data["least_problematic_groups"][0]
    assert group_metrics["group"] == group2.id
    assert group_metrics["complaints"] == 1
    assert group_metrics["participation"] == 1
    events = {item["group_id"]: item["total"] for item in data["events_by_group"]}
    assert events[group1.id] == 1
    assert events[group2.id] == 1


@pytest.mark.django_db
def test_complaints_analytics_filters_by_query_params():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="1A",
        grade_level=1,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="1B",
        grade_level=1,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    # complaints
    Complaint.objects.create(
        school=school,
        group=group1,
        created_by=parent,
        target_teacher=teacher,
        description="d1",
        status=Complaint.Status.OPEN,
    )
    Complaint.objects.create(
        school=school,
        group=group2,
        created_by=parent,
        target_teacher=teacher,
        description="d2",
        status=Complaint.Status.RESOLVED,
    )

    now = timezone.now()
    event = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E",
        description="",
        location="",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event, group=group2)

    token = str(RefreshToken.for_user(director).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get(
        f"/api/v1/analytics/complaints/?group_id={group2.id}&status={Complaint.Status.RESOLVED}"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["complaints_total"] == 1
    assert data["complaints_open"] == 0
    assert data["complaints_by_group"] == [{"group": group2.id, "total": 1}]
    assert data["least_problematic_groups"] == [
        {"group": group2.id, "complaints": 1, "participation": 1}
    ]
    events = {item["group_id"]: item["total"] for item in data["events_by_group"]}
    assert events == {group2.id: 1}
