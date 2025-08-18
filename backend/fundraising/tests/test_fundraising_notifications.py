import pytest
from datetime import date

from django.db.backends.sqlite3.base import DatabaseWrapper as SQLiteWrapper

from core.models import Group, School, SchoolYear, User
from notifications.models import NotificationPreference
from fundraising.models import (
    ExpenseEvidence,
    FundraisingEvent,
    FundraisingGroupLedger,
)


SQLiteWrapper.set_schema = lambda self, schema_name, tenant_type="", include_public=False: None
SQLiteWrapper.set_schema_to_public = lambda self: None
SQLiteWrapper.schema_name = "public"


@pytest.mark.django_db
def test_notify_new_ledger(monkeypatch):
    school = School(name="S1", slug="s1", subdomain="s1")
    school.auto_create_schema = False
    school.save()
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )
    director1 = User.objects.create(
        username="d1", school=school, role="DIRECTOR", email="d1@example.com"
    )
    director2 = User.objects.create(
        username="d2", school=school, role="DIRECTOR", email="d2@example.com"
    )
    teacher = User.objects.create(
        username="t1", school=school, role="MAESTRO_TITULAR", email="t1@example.com"
    )
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=year,
        name="Fair",
        date=date(2023, 10, 10),
    )

    calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        calls.append((school_id, list(user_ids), data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    FundraisingGroupLedger.objects.create(
        event=event,
        group=group,
        amount_collected="100.00",
        created_by=director1,
    )

    assert calls
    school_id, user_ids, data, kind = calls[0]
    assert school_id == school.id
    assert set(user_ids) == {teacher.id, director2.id}
    assert data == {"event_id": event.id}
    assert kind == NotificationPreference.Kind.FUNDRAISING


@pytest.mark.django_db
def test_notify_new_expense_evidence(monkeypatch):
    school = School(name="S1", slug="s1", subdomain="s1")
    school.auto_create_schema = False
    school.save()
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )
    director1 = User.objects.create(
        username="d1", school=school, role="DIRECTOR", email="d1@example.com"
    )
    director2 = User.objects.create(
        username="d2", school=school, role="DIRECTOR", email="d2@example.com"
    )
    teacher = User.objects.create(
        username="t1", school=school, role="MAESTRO_TITULAR", email="t1@example.com"
    )
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=year,
        name="Fair",
        date=date(2023, 10, 10),
    )
    ledger = FundraisingGroupLedger.objects.create(
        event=event,
        group=group,
        amount_collected="100.00",
        created_by=teacher,
    )

    calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        calls.append((school_id, list(user_ids), data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    ExpenseEvidence.objects.create(
        ledger=ledger,
        group=group,
        uploader=director1,
        file_url="http://example.com/r.pdf",
        amount="10.00",
        concept="Compra",
    )

    assert calls
    school_id, user_ids, data, kind = calls[0]
    assert school_id == school.id
    assert set(user_ids) == {teacher.id, director2.id}
    assert data == {"event_id": event.id}
    assert kind == NotificationPreference.Kind.FUNDRAISING
