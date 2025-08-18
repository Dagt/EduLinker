import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User


@pytest.mark.django_db
def test_only_director_can_create_global_announcement():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    SchoolYear.objects.create(
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

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/announcements/",
        {"title": "A", "message": "m", "scope": "GLOBAL"},
        format="json",
    )
    assert res.status_code == 403

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/announcements/",
        {"title": "A", "message": "m", "scope": "GLOBAL"},
        format="json",
    )
    assert res.status_code == 201
    assert res.json()["teacher"] == director.id
