import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User, VocalAssignment
from fundraising.models import FundraisingGroupLedger, ExpenseEvidence


def _client_for(user, school):
    token = str(RefreshToken.for_user(user).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    return client


@pytest.fixture
def setup_entities(db):
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
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
    return school, director, parent, group


@pytest.mark.django_db
def test_vocal_can_record_ledger(setup_entities):
    school, director, parent, group = setup_entities
    client = _client_for(director, school)
    res = client.post(
        "/api/v1/fundraising-events/",
        {"name": "Kermes", "date": "2025-10-10"},
        format="json",
    )
    assert res.status_code in (200, 201)
    event_id = res.json()["id"]

    client = _client_for(parent, school)
    res = client.post(
        "/api/v1/fundraising-ledger/",
        {"event": event_id, "group": group.id, "amount_collected": "50.00"},
        format="json",
    )
    assert res.status_code in (200, 201)
    assert FundraisingGroupLedger.objects.filter(event_id=event_id, group=group).exists()


@pytest.mark.django_db
def test_vocal_can_upload_expense_evidence(setup_entities):
    school, director, parent, group = setup_entities
    client = _client_for(director, school)
    res = client.post(
        "/api/v1/fundraising-events/",
        {"name": "Kermes", "date": "2025-10-10"},
        format="json",
    )
    event_id = res.json()["id"]
    client = _client_for(parent, school)
    res = client.post(
        "/api/v1/fundraising-ledger/",
        {"event": event_id, "group": group.id, "amount_collected": "100.00"},
        format="json",
    )
    ledger_id = res.json()["id"]
    res = client.post(
        "/api/v1/expense-evidences/",
        {
            "ledger": ledger_id,
            "file_url": "http://example.com/evidence.jpg",
            "amount": "20.00",
            "concept": "Food",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    assert ExpenseEvidence.objects.filter(ledger_id=ledger_id).count() == 1
    # summary should include the expense evidence
    client = _client_for(director, school)
    res = client.get(f"/api/v1/fundraising-events/{event_id}/summary/")
    assert res.status_code == 200
    data = res.json()
    assert len(data["expenses"]) == 1
