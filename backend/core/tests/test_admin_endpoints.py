import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User


@pytest.mark.django_db
def test_director_can_create_user():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(
        username="director@x.com",
        email="director@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.post(
        "/api/v1/users/",
        {
            "first_name": "Ana",
            "last_name": "Lopez",
            "email": "ana@x.com",
            "role": "PADRE",
            "password": "temp1234",
        },
        format="json",
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "ana@x.com"


@pytest.mark.django_db
def test_admin_tenant_can_update_user_role():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    admin = User.objects.create_user(
        username="admin@x.com",
        email="admin@x.com",
        password="p",
        role="ADMIN_TENANT",
        school=school,
    )
    target = User.objects.create_user(
        username="target@x.com",
        email="target@x.com",
        password="p",
        role="PADRE",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(admin).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.patch(
        f"/api/v1/users/{target.id}/role/",
        {"role": "VOCAL", "is_active": False},
        format="json",
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "VOCAL"
    assert data["is_active"] is False


@pytest.mark.django_db
def test_director_can_create_and_update_student():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(
        username="director@x.com",
        email="director@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.post(
        "/api/v1/students/",
        {
            "first_name": "Ana",
            "last_name": "Lopez",
            "grade_level": 5,
            "enrollment_code": "E-1",
        },
        format="json",
    )
    assert res.status_code == 201
    student_id = res.json()["id"]

    res = client.patch(
        f"/api/v1/students/{student_id}/",
        {"first_name": "Ana Maria", "last_name": "Lopez", "grade_level": 6, "enrollment_code": "E-1"},
        format="json",
    )
    assert res.status_code == 200
    assert res.json()["grade_level"] == 6


@pytest.mark.django_db
def test_director_can_create_group():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    SchoolYear.objects.create(
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
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.post(
        "/api/v1/groups/create/",
        {"name": "5A", "grade_level": 5},
        format="json",
    )
    assert res.status_code == 201
    assert res.json()["name"] == "5A"
