import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, Group, User, VocalAssignment
from fundraising.models import FundraisingEvent, FundraisingGroupLedger
from audit.models import AuditLog


def _client_for(user, school):
    token = str(RefreshToken.for_user(user).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    return client


@pytest.mark.django_db
def test_expense_evidence_audit_with_ledger():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
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
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=sy,
        name="Kermes",
        date="2025-10-10",
    )
    ledger = FundraisingGroupLedger.objects.create(
        event=event,
        group=group,
        amount_collected="100.00",
        created_by=parent,
    )

    client = _client_for(parent, school)
    res = client.post(
        "/api/v1/expense-evidences/",
        {
            "ledger": ledger.id,
            "file_url": "http://example.com/evidence.jpg",
            "amount": "20.00",
            "concept": "Food",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    expense_id = res.json()["id"]
    log = AuditLog.objects.filter(
        action="expense_create", entity_type="expense_evidence", entity_id=expense_id
    ).first()
    assert log is not None
    assert log.metadata["ledger_id"] == ledger.id
    assert log.metadata["group_id"] == group.id
    assert log.metadata["amount"] == "20.00"
    assert log.metadata["concept"] == "Food"


@pytest.mark.django_db
def test_expense_evidence_audit_with_group_only():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
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

    client = _client_for(parent, school)
    res = client.post(
        "/api/v1/expense-evidences/",
        {
            "group": group.id,
            "file_url": "http://example.com/evidence.jpg",
            "amount": "15.00",
            "concept": "Paint",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    expense_id = res.json()["id"]
    log = AuditLog.objects.filter(
        action="expense_create", entity_type="expense_evidence", entity_id=expense_id
    ).first()
    assert log is not None
    assert log.metadata["ledger_id"] is None
    assert log.metadata["group_id"] == group.id
    assert log.metadata["amount"] == "15.00"
    assert log.metadata["concept"] == "Paint"

