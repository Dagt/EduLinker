import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, Group, User
from audit.models import AuditLog


@pytest.mark.django_db
def test_complaint_message_logged():
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
    complaint_id = res.data["id"]

    res = client.post(
        f"/api/v1/complaints/{complaint_id}/messages/",
        {"message": "Hola"},
        format="json",
    )
    assert res.status_code in (200, 201)

    assert AuditLog.objects.filter(
        action="message_create",
        entity_type="complaint",
        entity_id=complaint_id,
        actor=parent,
        metadata__complaint_id=complaint_id,
        metadata__author_id=parent.id,
    ).exists()


@pytest.mark.django_db
def test_complaint_participant_add_logged():
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
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
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
    complaint_id = res.data["id"]

    res = client.post(
        f"/api/v1/complaints/{complaint_id}/participants/",
        {"user": director.id, "role_in_thread": "DIRECTOR"},
        format="json",
    )
    assert res.status_code in (200, 201)

    assert AuditLog.objects.filter(
        action="participant_add",
        entity_type="complaint",
        entity_id=complaint_id,
        actor=parent,
        metadata__complaint_id=complaint_id,
        metadata__user_added_id=director.id,
    ).exists()

