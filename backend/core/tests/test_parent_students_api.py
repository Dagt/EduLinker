import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, User, Student, ParentStudent


@pytest.mark.django_db(transaction=True)
def test_director_can_manage_parent_students():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(
        username="director@s.com",
        email="director@s.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    parent = User.objects.create_user(
        username="parent@s.com",
        email="parent@s.com",
        password="p",
        role="PADRE",
        school=school,
    )
    student = Student.objects.create(
        school=school,
        first_name="Ana",
        last_name="Lopez",
        grade_level=3,
        enrollment_code="E1",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    create_res = client.post(
        "/api/v1/parent-students/",
        {"parent": parent.id, "student": student.id, "relationship": "F"},
        format="json",
    )
    assert create_res.status_code == 201

    list_res = client.get("/api/v1/parent-students/")
    assert list_res.status_code == 200
    results = list_res.data.get("results", list_res.data)
    assert len(results) == 1

    relation_id = results[0]["id"]
    delete_res = client.delete(f"/api/v1/parent-students/{relation_id}/")
    assert delete_res.status_code == 204
    assert ParentStudent.objects.count() == 0


@pytest.mark.django_db(transaction=True)
def test_parent_student_permissions_and_tenant_guard():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    other_school = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    director = User.objects.create_user(
        username="director@s.com",
        email="director@s.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    parent = User.objects.create_user(
        username="parent@s.com",
        email="parent@s.com",
        password="p",
        role="PADRE",
        school=school,
    )
    other_parent = User.objects.create_user(
        username="parent@s2.com",
        email="parent@s2.com",
        password="p",
        role="PADRE",
        school=other_school,
    )
    student = Student.objects.create(
        school=school,
        first_name="Ana",
        last_name="Lopez",
        grade_level=3,
        enrollment_code="E1",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    cross_res = client.post(
        "/api/v1/parent-students/",
        {"parent": other_parent.id, "student": student.id, "relationship": "F"},
        format="json",
    )
    assert cross_res.status_code == 403

    parent_token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {parent_token}", HTTP_X_SCHOOL_ID=str(school.id))
    list_res = client.get("/api/v1/parent-students/")
    assert list_res.status_code == 403
