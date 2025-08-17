import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    User,
    Group,
    Student,
    GroupMembership,
    ParentStudent,
    SpecialistAssignment,
    VocalAssignment,
)


@pytest.mark.django_db(transaction=True)
def test_director_can_view_members():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=5,
        enrollment_code="e1",
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent,
        student=student,
        relationship="father",
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.get(f"/api/v1/groups/{group.id}/members/")
    assert res.status_code == 200
    data = res.json()
    assert data["students"][0]["id"] == student.id
    assert data["parents"][0]["id"] == parent.id


@pytest.mark.django_db(transaction=True)
def test_homeroom_teacher_can_view_members():
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
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=5,
        enrollment_code="e1",
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent,
        student=student,
        relationship="father",
    )
    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.get(f"/api/v1/groups/{group.id}/members/")
    assert res.status_code == 200


@pytest.mark.django_db(transaction=True)
def test_specialist_can_view_members():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=5,
        enrollment_code="e1",
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent,
        student=student,
        relationship="father",
    )
    specialist = User.objects.create_user(
        username="s@x.com",
        email="s@x.com",
        password="p",
        role="MAESTRO_ITINERANTE",
        school=school,
    )
    SpecialistAssignment.objects.create(
        school=school, group=group, teacher=specialist, subject="Math"
    )
    client = APIClient()
    token = str(RefreshToken.for_user(specialist).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.get(f"/api/v1/groups/{group.id}/members/")
    assert res.status_code == 200


@pytest.mark.django_db(transaction=True)
def test_vocal_parent_can_view_members():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=5,
        enrollment_code="e1",
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent,
        student=student,
        relationship="father",
    )
    VocalAssignment.objects.create(
        school=school, group=group, parent=parent, assigned_by=parent
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.get(f"/api/v1/groups/{group.id}/members/")
    assert res.status_code == 200


@pytest.mark.django_db(transaction=True)
def test_non_vocal_parent_cannot_view_members():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=5,
        enrollment_code="e1",
    )
    GroupMembership.objects.create(
        school=school, group=group, student=student
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent,
        student=student,
        relationship="father",
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.get(f"/api/v1/groups/{group.id}/members/")
    assert res.status_code == 403
