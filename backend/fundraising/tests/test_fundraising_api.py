import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User, VocalAssignment
from fundraising.models import FundraisingGroupLedger
from audit.models import AuditLog


@pytest.mark.django_db
def test_director_event_and_vocal_ledger_and_summary():
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
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="VOCAL",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    VocalAssignment.objects.create(
        school=school, group=group, parent=parent, assigned_by=teacher, active=True
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.post(
        "/api/v1/fundraising-events/",
        {"name": "Kermes", "date": "2025-10-10"},
        format="json",
    )
    assert res.status_code in (200, 201)
    event_id = res.json()["id"]

    # vocal records ledger
    vocal_token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {vocal_token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.post(
        "/api/v1/fundraising-ledger/",
        {"event": event_id, "group": group.id, "amount_collected": "100.00"},
        format="json",
    )
    assert res.status_code in (200, 201)
    assert FundraisingGroupLedger.objects.filter(event_id=event_id).count() == 1
    assert AuditLog.objects.filter(action="create", entity_type="fundraising_ledger").exists()

    # summary endpoint
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/fundraising-events/{event_id}/summary/")
    assert res.status_code == 200
    data = res.json()
    assert data["total_collected"] == "100.00"


@pytest.mark.django_db
def test_teacher_cannot_create_event():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/fundraising-events/",
        {"name": "Kermes", "date": "2025-10-10"},
        format="json",
    )
    assert res.status_code == 403
