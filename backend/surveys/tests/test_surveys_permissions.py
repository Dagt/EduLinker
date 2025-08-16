import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User
from surveys.models import Survey


@pytest.mark.django_db
def test_parent_cannot_create_school_survey():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    now = timezone.now()
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/surveys/",
        {
            "scope": "SCHOOL",
            "title": "T",
            "description": "",
            "options": ["A", "B"],
            "is_anonymous": False,
            "start_at": now.isoformat(),
            "end_at": (now + timedelta(days=1)).isoformat(),
        },
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_get_survey_wrong_school():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy = SchoolYear.objects.create(
        school=school1,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school1,
    )
    survey = Survey.objects.create(
        school=school1,
        created_by=director,
        scope=Survey.Scope.SCHOOL,
        title="T",
        description="",
        options=["A", "B"],
        is_anonymous=False,
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(days=1),
        status=Survey.Status.ACTIVE,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school1,
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id)
    )
    res = client.get(f"/api/v1/surveys/{survey.id}/")
    assert res.status_code == 404
