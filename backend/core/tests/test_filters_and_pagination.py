import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User, Student, Complaint, Event, Group


@pytest.mark.django_db
def test_user_filters_and_pagination():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(
        username="director@x.com",
        email="director@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    User.objects.create_user(
        username="alice@x.com",
        email="alice@x.com",
        password="p",
        role="PADRE",
        first_name="Alice",
        last_name="Rivera",
        school=school,
    )
    User.objects.create_user(
        username="bob@x.com",
        email="bob@x.com",
        password="p",
        role="PADRE",
        first_name="Bob",
        last_name="Marin",
        school=school,
        is_active=False,
    )
    for idx in range(4):
        User.objects.create_user(
            username=f"user{idx}@x.com",
            email=f"user{idx}@x.com",
            password="p",
            role="PADRE",
            school=school,
        )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get("/api/v1/users/?name=Alice")
    assert res.status_code == 200
    assert res.json()["results"][0]["email"] == "alice@x.com"

    res = client.get("/api/v1/users/?status=inactive")
    assert res.status_code == 200
    assert res.json()["results"][0]["email"] == "bob@x.com"

    res = client.get("/api/v1/users/?page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 6
    assert len(data["results"]) == 2


@pytest.mark.django_db
def test_student_filters():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(
        username="director@x.com",
        email="director@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    Student.objects.create(
        school=school,
        first_name="Ana",
        last_name="Lopez",
        grade_level=3,
        enrollment_code="e1",
    )
    Student.objects.create(
        school=school,
        first_name="Bruno",
        last_name="Diaz",
        grade_level=5,
        enrollment_code="e2",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get("/api/v1/students/?name=Ana")
    assert res.status_code == 200
    assert res.json()["results"][0]["first_name"] == "Ana"

    res = client.get("/api/v1/students/?grade_level=5")
    assert res.status_code == 200
    assert res.json()["results"][0]["first_name"] == "Bruno"


@pytest.mark.django_db
def test_event_and_complaint_filters():
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
        homeroom_teacher=director,
    )
    Complaint.objects.create(
        school=school,
        group=group,
        created_by=parent,
        target_teacher=director,
        description="test",
        status=Complaint.Status.OPEN,
    )
    Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GLOBAL,
        title="Reunion General",
        description="",
        location="",
        start_at="2025-09-01T10:00:00Z",
        end_at="2025-09-01T11:00:00Z",
        created_by=director,
        status=Event.Status.CANCELLED,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get("/api/v1/complaints/?name=Ana")
    assert res.status_code == 200
    assert res.json()["results"][0]["created_by"] == parent.id

    res = client.get("/api/v1/events/?name=Reunion&status=CANCELLED")
    assert res.status_code == 200
    assert res.json()["results"][0]["title"] == "Reunion General"
