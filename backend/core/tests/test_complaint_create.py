import pytest
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
    SpecialistAssignment,
)


@pytest.mark.django_db
def test_parent_without_child_cannot_create_complaint():
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
    # Parent has child but not enrolled in group
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="FATHER"
    )

    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.post(
        "/api/v1/complaints/",
        {"group": group.id, "target_teacher": teacher.id, "description": "Desc"},
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_teacher_not_assigned_cannot_be_target():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    homeroom = User.objects.create_user(
        username="h@x.com",
        email="h@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=homeroom
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

    outsider_teacher = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.post(
        "/api/v1/complaints/",
        {
            "group": group.id,
            "target_teacher": outsider_teacher.id,
            "description": "Desc",
        },
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_parent_can_target_itinerant_teacher():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    homeroom = User.objects.create_user(
        username="h@x.com",
        email="h@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=homeroom
    )
    itinerant = User.objects.create_user(
        username="it@x.com",
        email="it@x.com",
        password="p",
        role="MAESTRO_ITINERANTE",
        school=school,
    )
    SpecialistAssignment.objects.create(
        school=school, group=group, teacher=itinerant, subject="Music"
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

    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.post(
        "/api/v1/complaints/",
        {
            "group": group.id,
            "target_teacher": itinerant.id,
            "description": "Desc",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
