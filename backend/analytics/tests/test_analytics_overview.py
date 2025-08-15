import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User, Group, Complaint
from fundraising.models import FundraisingEvent, FundraisingGroupLedger
from surveys.models import Survey, SurveyVote
from suggestions.models import Suggestion


@pytest.mark.django_db
def test_analytics_view_permissions_and_results():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    director = User.objects.create_user(username="d@x.com", email="d@x.com", password="p", role="DIRECTOR", school=school)
    teacher = User.objects.create_user(username="t@x.com", email="t@x.com", password="p", role="MAESTRO_TITULAR", school=school)
    parent = User.objects.create_user(username="p@x.com", email="p@x.com", password="p", role="PADRE", school=school)
    group = Group.objects.create(school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher)

    Complaint.objects.create(school=school, group=group, created_by=parent, target_teacher=teacher, description="d1", status=Complaint.Status.OPEN)
    Complaint.objects.create(school=school, group=group, created_by=parent, target_teacher=teacher, description="d2", status=Complaint.Status.CLOSED)

    Suggestion.objects.create(school=school, group=group, created_by=parent, title="s1", description="x", status=Suggestion.Status.OPEN)
    Suggestion.objects.create(school=school, group=group, created_by=parent, title="s2", description="x", status=Suggestion.Status.RESOLVED)

    fe = FundraisingEvent.objects.create(school=school, school_year=sy, name="F", date="2025-01-01")
    FundraisingGroupLedger.objects.create(event=fe, group=group, amount_collected=100, created_by=director)

    now = timezone.now()
    survey = Survey.objects.create(
        school=school,
        created_by=director,
        scope=Survey.Scope.GROUP,
        group=group,
        title="T",
        description="",
        options=["A"],
        is_anonymous=False,
        start_at=now,
        end_at=now + timedelta(days=1),
        status=Survey.Status.ACTIVE,
    )
    SurveyVote.objects.create(survey=survey, voter=parent, option_index=0)

    client = APIClient()
    res = client.get("/api/v1/analytics/overview/")
    assert res.status_code in (400, 401, 403)

    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get("/api/v1/analytics/overview/")
    assert res.status_code == 200
    data = res.json()
    assert data["complaints_total"] == 2
    assert data["complaints_open"] == 1
    assert data["suggestions_total"] == 2
    assert any(item["group"] == group.id and item["total"] == 2 for item in data["complaints_by_group"])
    assert any(float(item["total"]) == 100.0 and item["group__id"] == group.id for item in data["fundraising_by_group"])
    assert any(item["survey__group"] == group.id and item["votes"] == 1 for item in data["surveys_participation"])
    assert any(item["status"] == "OPEN" and item["total"] == 1 for item in data["suggestions_by_status"])
