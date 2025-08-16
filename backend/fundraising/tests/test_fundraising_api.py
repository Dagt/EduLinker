import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User, VocalAssignment
from fundraising.models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence
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


@pytest.mark.django_db
def test_vocal_cannot_record_ledger_other_school():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy = SchoolYear.objects.create(
        school=school1,
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
        school=school1,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="VOCAL",
        school=school1,
    )
    group = Group.objects.create(
        school=school1,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    VocalAssignment.objects.create(
        school=school1, group=group, parent=parent, assigned_by=teacher, active=True
    )
    event = FundraisingEvent.objects.create(
        school=school1,
        school_year=sy,
        name="Kermes",
        date="2025-10-10",
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id)
    )
    res = client.post(
        "/api/v1/fundraising-ledger/",
        {"event": event.id, "group": group.id, "amount_collected": "50.00"},
        format="json",
    )
    assert res.status_code in (400, 403)


@pytest.mark.django_db
def test_vocal_ledger_list_and_permissions():
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
        role="VOCAL",
        school=school,
    )
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="5B",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    VocalAssignment.objects.create(
        school=school, group=group1, parent=parent, assigned_by=teacher, active=True
    )
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=sy,
        name="Kermes",
        date="2025-10-10",
    )
    ledger1 = FundraisingGroupLedger.objects.create(
        event=event, group=group1, amount_collected="10.00", created_by=parent
    )
    ledger2 = FundraisingGroupLedger.objects.create(
        event=event, group=group2, amount_collected="20.00", created_by=parent
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get("/api/v1/fundraising-ledger/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1 and data[0]["id"] == ledger1.id
    res = client.get(f"/api/v1/fundraising-ledger/{ledger1.id}/")
    assert res.status_code == 200
    res = client.get(f"/api/v1/fundraising-ledger/{ledger2.id}/")
    assert res.status_code == 404


@pytest.mark.django_db
def test_expense_evidence_crud_and_permissions():
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
    other_group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5B",
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
    ledger1 = FundraisingGroupLedger.objects.create(
        event=event, group=group, amount_collected="10.00", created_by=parent
    )
    ledger2 = FundraisingGroupLedger.objects.create(
        event=event, group=other_group, amount_collected="20.00", created_by=parent
    )
    ExpenseEvidence.objects.create(
        ledger=ledger2,
        uploader=parent,
        file_url="http://x.com/a.jpg",
        amount="5.00",
        concept="Snacks",
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/expense-evidences/",
        {
            "ledger": ledger1.id,
            "amount": "3.00",
            "concept": "Drinks",
            "file_url": "http://x.com/b.jpg",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    expense_id = res.json()["id"]
    res = client.get("/api/v1/expense-evidences/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1 and data[0]["id"] == expense_id
    res = client.get(f"/api/v1/expense-evidences/{expense_id}/")
    assert res.status_code == 200
    # cannot access expense of other group
    other_expense = ExpenseEvidence.objects.filter(ledger=ledger2).first()
    res = client.get(f"/api/v1/expense-evidences/{other_expense.id}/")
    assert res.status_code == 404


@pytest.mark.django_db
def test_summary_wrong_school_forbidden():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    sy1 = SchoolYear.objects.create(
        school=school1,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    director1 = User.objects.create_user(
        username="d1@x.com",
        email="d1@x.com",
        password="p",
        role="DIRECTOR",
        school=school1,
    )
    User.objects.create_user(
        username="d2@x.com",
        email="d2@x.com",
        password="p",
        role="DIRECTOR",
        school=school2,
    )
    event = FundraisingEvent.objects.create(
        school=school1,
        school_year=sy1,
        name="Kermes",
        date="2025-10-10",
    )
    client = APIClient()
    token = str(RefreshToken.for_user(director1).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id))
    res = client.get(f"/api/v1/fundraising-events/{event.id}/summary/")
    assert res.status_code == 404


@pytest.mark.django_db
def test_event_update_requires_director_and_teachers_can_read():
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
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=sy,
        name="Kermes",
        date="2025-10-10",
    )
    client = APIClient()
    teacher_token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {teacher_token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/fundraising-events/{event.id}/")
    assert res.status_code == 200
    res = client.patch(
        f"/api/v1/fundraising-events/{event.id}/update/",
        {"name": "Feria"},
        format="json",
    )
    assert res.status_code == 403
    director_token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {director_token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.patch(
        f"/api/v1/fundraising-events/{event.id}/update/",
        {"name": "Feria"},
        format="json",
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Feria"
