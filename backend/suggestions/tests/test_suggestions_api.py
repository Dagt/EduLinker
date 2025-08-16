import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User
from audit.models import AuditLog


@pytest.mark.django_db
def test_parent_can_create_suggestion_and_teacher_updates_status():
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
        "/api/v1/suggestions/",
        {
            "group": group.id,
            "target_teacher": teacher.id,
            "title": "Idea",
            "description": "Más excursiones",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    suggestion_id = res.json()["id"]

    # Teacher updates status
    teacher_token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {teacher_token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.patch(
        f"/api/v1/suggestions/{suggestion_id}/",
        {"status": "IN_REVIEW"},
        format="json",
    )
    assert res.status_code == 200
    assert res.json()["status"] == "IN_REVIEW"
    assert AuditLog.objects.filter(action="status_change", entity_type="suggestion", entity_id=suggestion_id).exists()
