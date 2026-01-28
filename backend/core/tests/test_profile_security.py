import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User


def _auth_client(user, school):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    return client


@pytest.mark.django_db
def test_regenerate_ics_token_rotates_and_invalidates_old():
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
    old_token = str(user.ics_token)
    client = _auth_client(user, school)

    res = client.post("/api/v1/me/regenerate-ics/")
    assert res.status_code == 200
    data = res.json()
    assert data["ics_token"] != old_token
    assert data["calendar_subscription_url"].endswith(
        f"/api/v1/events/ics/?token={data['ics_token']}&school_id={school.id}"
    )

    old_res = client.get(f"/api/v1/events/ics/?token={old_token}")
    assert old_res.status_code == 404


@pytest.mark.django_db
def test_regenerate_ics_token_rejects_wrong_school():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    other = School.objects.create(name="O", slug="o", subdomain="o", active=True)
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
    client = _auth_client(user, other)
    res = client.post("/api/v1/me/regenerate-ics/")
    assert res.status_code == 403


@pytest.mark.django_db
def test_update_me_profile_and_change_password():
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
        password="old-pass",
        role="DIRECTOR",
        school=school,
    )
    client = _auth_client(user, school)

    update_res = client.put(
        "/api/v1/me/",
        {
            "first_name": "Ana",
            "last_name": "Torres",
            "preferred_language": "en",
        },
        format="json",
    )
    assert update_res.status_code == 200
    user.refresh_from_db()
    assert user.first_name == "Ana"
    assert user.last_name == "Torres"
    assert user.preferred_language == "en"

    pw_res = client.post(
        "/api/v1/auth/change-password/",
        {
            "current_password": "old-pass",
            "new_password": "new-pass",
            "confirm_password": "new-pass",
        },
        format="json",
    )
    assert pw_res.status_code == 200
    user.refresh_from_db()
    assert user.check_password("new-pass")
