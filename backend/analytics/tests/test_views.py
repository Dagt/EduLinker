import pytest
from datetime import date, timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User, Group, Complaint, Event
from fundraising.models import FundraisingEvent, FundraisingGroupLedger
from surveys.models import Survey, SurveyVote
from suggestions.models import Suggestion


@pytest.mark.django_db
def test_director_accesses_analytics_endpoints():
    """A director can access analytics endpoints and receives data scoped to their school."""
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)

    sy1 = SchoolYear.objects.create(
        school=school1,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    sy2 = SchoolYear.objects.create(
        school=school2,
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
        school=school1,
    )

    teacher1 = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school1,
    )
    teacher2 = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school2,
    )

    parent1 = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school1,
    )
    parent2 = User.objects.create_user(
        username="p2@x.com",
        email="p2@x.com",
        password="p",
        role="PADRE",
        school=school2,
    )

    group1 = Group.objects.create(
        school=school1,
        school_year=sy1,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher1,
    )
    group2 = Group.objects.create(
        school=school2,
        school_year=sy2,
        name="G2",
        grade_level=1,
        homeroom_teacher=teacher2,
    )

    Complaint.objects.create(
        school=school1,
        group=group1,
        created_by=parent1,
        target_teacher=teacher1,
        description="c1",
    )
    Complaint.objects.create(
        school=school1,
        group=group1,
        created_by=parent1,
        target_teacher=teacher1,
        description="c1b",
    )
    Complaint.objects.create(
        school=school2,
        group=group2,
        created_by=parent2,
        target_teacher=teacher2,
        description="c2",
    )

    Suggestion.objects.create(
        school=school1,
        group=group1,
        created_by=teacher1,
        target_teacher=teacher1,
        title="s1",
        description="d1",
    )
    Suggestion.objects.create(
        school=school2,
        group=group2,
        created_by=teacher2,
        target_teacher=teacher2,
        title="s2",
        description="d2",
    )

    event1 = FundraisingEvent.objects.create(
        school=school1, school_year=sy1, name="F1", date=date(2025, 5, 1)
    )
    FundraisingGroupLedger.objects.create(
        event=event1, group=group1, amount_collected=100, created_by=teacher1
    )
    event1b = FundraisingEvent.objects.create(
        school=school1, school_year=sy1, name="F1b", date=date(2025, 6, 1)
    )
    FundraisingGroupLedger.objects.create(
        event=event1b, group=group1, amount_collected=50, created_by=teacher1
    )
    event2 = FundraisingEvent.objects.create(
        school=school2, school_year=sy2, name="F2", date=date(2025, 5, 1)
    )
    FundraisingGroupLedger.objects.create(
        event=event2, group=group2, amount_collected=200, created_by=teacher2
    )

    now = timezone.now()
    survey1 = Survey.objects.create(
        school=school1,
        created_by=teacher1,
        scope="GROUP",
        group=group1,
        title="S1",
        description="d",
        options=["A"],
        is_anonymous=False,
        start_at=now,
        end_at=now + timedelta(days=1),
        status="ACTIVE",
    )
    SurveyVote.objects.create(survey=survey1, voter=teacher1, option_index=0)

    survey2 = Survey.objects.create(
        school=school2,
        created_by=teacher2,
        scope="GROUP",
        group=group2,
        title="S2",
        description="d",
        options=["A"],
        is_anonymous=False,
        start_at=now,
        end_at=now + timedelta(days=1),
        status="ACTIVE",
    )
    SurveyVote.objects.create(survey=survey2, voter=teacher2, option_index=0)

    start = now + timedelta(days=2)
    end = start + timedelta(hours=1)
    Event.objects.create(
        school=school1,
        school_year=sy1,
        scope="GLOBAL",
        title="EG",
        description="",
        location="",
        start_at=start,
        end_at=end,
        created_by=teacher1,
    )
    Event.objects.create(
        school=school1,
        school_year=sy1,
        scope="GROUP",
        title="EG2",
        description="",
        location="",
        start_at=start,
        end_at=end,
        created_by=teacher1,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school1.id)
    )

    res = client.get("/api/v1/analytics/overview/")
    assert res.status_code == 200
    data = res.json()
    assert data["complaints_total"] == 2
    assert data["events_total"] == 2
    assert float(data["fundraising_total"]) == 150.0
    by_group = {item["group__id"]: float(item["total"]) for item in data["fundraising_by_group"]}
    assert by_group[group1.id] == 150.0
    by_event = {item["event__id"]: float(item["total"]) for item in data["fundraising_by_event"]}
    assert by_event[event1.id] == 100.0
    assert by_event[event1b.id] == 50.0
    assert data["surveys_participation_by_survey"][0]["survey_id"] == survey1.id
    assert data["surveys_participation_by_survey"][0]["votes"] == 1
    scopes = {item["scope"]: item["total"] for item in data["events_by_scope"]}
    assert scopes == {"GLOBAL": 1, "GROUP": 1}

    res = client.get("/api/v1/analytics/complaints/")
    assert res.status_code == 200
    data = res.json()
    assert data["complaints_total"] == 2
    assert data["top_parents_by_complaints"][0]["created_by"] == parent1.id
    assert data["top_parents_by_complaints"][0]["total"] == 2

    res = client.get("/api/v1/analytics/fundraising/")
    assert res.status_code == 200
    data = res.json()
    assert float(data["fundraising_total"]) == 150.0
    by_group = {item["group__id"]: float(item["total"]) for item in data["fundraising_by_group"]}
    assert by_group[group1.id] == 150.0

    res = client.get(f"/api/v1/analytics/fundraising/?event_id={event1.id}")
    assert res.status_code == 200
    data = res.json()
    assert float(data["fundraising_total"]) == 100.0
    fund_event = {item["event__id"]: float(item["total"]) for item in data["fundraising_by_event"]}
    assert fund_event == {event1.id: 100.0}


@pytest.mark.django_db
def test_non_director_forbidden():
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
        school=school, school_year=sy, name="G", grade_level=1, homeroom_teacher=teacher
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    for url in ["overview", "complaints", "fundraising"]:
        res = client.get(f"/api/v1/analytics/{url}/")
        assert res.status_code == 403


@pytest.mark.django_db
def test_analytics_forbids_cross_school_access():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school1,
    )
    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id)
    )
    res = client.get("/api/v1/analytics/overview/")
    assert res.status_code == 403

