import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User


@pytest.mark.django_db
def test_me_view_returns_ics_token_and_subscription_url():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    user = User.objects.create_user(
        username="u@x.com",
        email="u@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get("/api/v1/me/")
    assert res.status_code == 200
    data = res.json()
    assert data["ics_token"] == str(user.ics_token)
    assert data["calendar_subscription_url"].endswith(
        f"/api/v1/events/ics/?token={user.ics_token}&school_id={school.id}"
    )
    assert data["preferred_language"] == "es"
