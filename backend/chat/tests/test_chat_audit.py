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
)
from audit.models import AuditLog


@pytest.mark.django_db
def test_director_audit_logs_chat_read():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
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

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/chats/{group.id}/messages/?audit=1")
    assert res.status_code == 200
    assert AuditLog.objects.filter(
        action="read",
        entity_type="chat_message",
        entity_id=group.id,
        actor=director,
    ).exists()


@pytest.mark.django_db
def test_non_director_audit_param_no_log():
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
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher
    )
    student = Student.objects.create(
        school=school, first_name="A", last_name="S", grade_level=5, enrollment_code="E1"
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="F"
    )

    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/chats/{group.id}/messages/?audit=1")
    assert res.status_code == 200
    assert not AuditLog.objects.filter(actor=parent).exists()

