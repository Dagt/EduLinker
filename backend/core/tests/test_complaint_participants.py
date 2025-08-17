import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    User,
    Group,
    Student,
    ParentStudent,
    GroupMembership,
)


@pytest.mark.django_db(transaction=True)
def test_participant_flow_access():
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
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    student = Student.objects.create(
        school=school,
        first_name="S",
        last_name="S",
        grade_level=5,
        enrollment_code="e1",
    )
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="FATHER"
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    outsider = User.objects.create_user(
        username="o@x.com",
        email="o@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )

    client_parent = APIClient()
    token_parent = str(RefreshToken.for_user(parent).access_token)
    client_parent.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_parent}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client_parent.post(
        "/api/v1/complaints/",
        {
            "group": group.id,
            "target_teacher": teacher.id,
            "description": "Desc",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    complaint_id = res.data["id"]

    client_outsider = APIClient()
    token_outsider = str(RefreshToken.for_user(outsider).access_token)
    client_outsider.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_outsider}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client_outsider.get(f"/api/v1/complaints/{complaint_id}/")
    assert res.status_code == 403

    res = client_parent.post(
        f"/api/v1/complaints/{complaint_id}/participants/",
        {"user": outsider.id, "role_in_thread": "MAESTRO_TITULAR"},
        format="json",
    )
    assert res.status_code in (200, 201)
    assert res.data["added_by"] == parent.id

    res = client_outsider.get(f"/api/v1/complaints/{complaint_id}/")
    assert res.status_code == 200


@pytest.mark.django_db(transaction=True)
def test_cannot_add_participant_from_other_school():
    school = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    other_school = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher
    )
    parent = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    student = Student.objects.create(
        school=school,
        first_name="S",
        last_name="S",
        grade_level=5,
        enrollment_code="e1",
    )
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="FATHER"
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    outsider = User.objects.create_user(
        username="o1@x.com",
        email="o1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=other_school,
    )

    client_parent = APIClient()
    token_parent = str(RefreshToken.for_user(parent).access_token)
    client_parent.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_parent}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client_parent.post(
        "/api/v1/complaints/",
        {
            "group": group.id,
            "target_teacher": teacher.id,
            "description": "Desc",
        },
        format="json",
    )
    complaint_id = res.data["id"]

    res = client_parent.post(
        f"/api/v1/complaints/{complaint_id}/participants/",
        {"user": outsider.id, "role_in_thread": "MAESTRO_TITULAR"},
        format="json",
    )
    assert res.status_code == 400
