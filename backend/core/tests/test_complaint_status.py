import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User, Group, Complaint
from audit.models import AuditLog


@pytest.mark.django_db(transaction=True)
def test_parent_can_escalate_complaint_status():
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

    res = client.patch(
        f"/api/v1/complaints/{complaint_id}/status/",
        {"status": "ESCALATED"},
        format="json",
    )
    assert res.status_code in (200, 202)
    complaint = Complaint.objects.get(id=complaint_id)
    assert complaint.status == Complaint.Status.ESCALATED

    log = AuditLog.objects.filter(
        entity_type="complaint", entity_id=complaint_id, action="status_change"
    ).first()
    assert log is not None
    assert log.metadata == {"from": "OPEN", "to": "ESCALATED"}


@pytest.mark.django_db(transaction=True)
def test_parent_cannot_set_invalid_status():
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

    res = client.patch(
        f"/api/v1/complaints/{complaint_id}/status/",
        {"status": "RESOLVED"},
        format="json",
    )
    assert res.status_code == 403
