import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User, Group, Complaint

@pytest.mark.django_db
def test_parent_can_create_private_complaint():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    teacher = User.objects.create_user(username="t@x.com", email="t@x.com", password="p", role="MAESTRO_TITULAR", school=school)
    group = Group.objects.create(school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher)
    parent = User.objects.create_user(username="p@x.com", email="p@x.com", password="p", role="PADRE", school=school)

    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    # Crear queja
    res = client.post("/api/v1/complaints/", {
        "group": group.id,
        "target_teacher": teacher.id,
        "description": "Prueba"
    }, format="json")
    assert res.status_code in (200,201)


@pytest.mark.django_db
def test_unrelated_user_cannot_access_private_complaint():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    creator = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    other_parent = User.objects.create_user(
        username="p2@x.com",
        email="p2@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    complaint = Complaint.objects.create(
        school=school,
        school_year=sy,
        group=group,
        created_by=creator,
        target_teacher=teacher,
        description="Test",
    )
    token = str(RefreshToken.for_user(other_parent).access_token)
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/complaints/{complaint.id}/")
    assert res.status_code == 403
