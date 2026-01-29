import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from audit.models import AuditLog
from core.models import School, SchoolYear, User, Group, Student, GroupMembership


@pytest.mark.django_db
def test_director_can_update_student_groups():
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
    )
    group_a = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    group_b = Group.objects.create(
        school=school, school_year=sy, name="5B", grade_level=5
    )
    student = Student.objects.create(
        school=school,
        first_name="Ana",
        last_name="Lopez",
        grade_level=5,
        enrollment_code="e1",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.patch(
        f"/api/v1/students/{student.id}/groups/",
        {"group_ids": [group_a.id], "replace_existing": True},
        format="json",
    )
    assert res.status_code == 200
    assert GroupMembership.objects.filter(student=student, group=group_a).exists()

    res = client.patch(
        f"/api/v1/students/{student.id}/groups/",
        {"group_ids": [group_b.id], "replace_existing": True, "allow_multiple_groups": True},
        format="json",
    )
    assert res.status_code == 200
    assert GroupMembership.objects.filter(student=student, group=group_b).exists()
    assert AuditLog.objects.filter(
        action="group_update", entity_type="student", entity_id=student.id
    ).exists()


@pytest.mark.django_db
def test_non_director_cannot_update_student_groups():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="teacher@x.com",
        email="teacher@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    student = Student.objects.create(
        school=school,
        first_name="Ana",
        last_name="Lopez",
        grade_level=5,
        enrollment_code="e1",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.patch(
        f"/api/v1/students/{student.id}/groups/",
        {"group_ids": [group.id]},
        format="json",
    )
    assert res.status_code == 403
