import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User, Group
from suggestions.models import Suggestion


@pytest.mark.django_db
def test_suggestion_filters():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    director = User.objects.create_user(
        username="director@x.com",
        email="director@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
        first_name="Dora",
        last_name="Perez",
    )
    parent = User.objects.create_user(
        username="parent@x.com",
        email="parent@x.com",
        password="p",
        role="PADRE",
        school=school,
        first_name="Ana",
        last_name="Gomez",
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
    )
    Suggestion.objects.create(
        school=school,
        group=group,
        created_by=parent,
        title="Mejora patio",
        description="Desc",
        status=Suggestion.Status.OPEN,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get("/api/v1/suggestions/?name=Ana")
    assert res.status_code == 200
    assert res.json()["results"][0]["created_by"] == parent.id

    res = client.get("/api/v1/suggestions/?status=OPEN")
    assert res.status_code == 200
    assert res.json()["results"][0]["title"] == "Mejora patio"
