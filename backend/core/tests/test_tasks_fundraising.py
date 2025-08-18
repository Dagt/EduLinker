import pytest
from django.utils import timezone
from datetime import timedelta

from core.models import School, SchoolYear, Group, User
from fundraising.models import (
    FundraisingEvent,
    FundraisingGroupLedger,
    ExpenseEvidence,
)
from core.tasks import send_fundraising_weekly_summary, push_to_users


@pytest.mark.django_db
def test_send_fundraising_weekly_summary(monkeypatch):
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
    g1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    g2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G2",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=sy,
        name="Fair",
        date="2025-10-10",
    )

    ledger1 = FundraisingGroupLedger.objects.create(
        event=event,
        group=g1,
        amount_collected="100.00",
        created_by=teacher,
    )
    ledger2 = FundraisingGroupLedger.objects.create(
        event=event,
        group=g2,
        amount_collected="200.00",
        created_by=teacher,
    )
    ExpenseEvidence.objects.create(
        ledger=ledger1,
        group=g1,
        uploader=teacher,
        file_url="http://file",
        amount="10.00",
        concept="Food",
    )
    old = FundraisingGroupLedger.objects.create(
        event=event,
        group=g1,
        amount_collected="50.00",
        created_by=teacher,
    )
    old.created_at = timezone.now() - timedelta(days=8)
    old.save(update_fields=["created_at"])

    calls = []

    def fake_delay(*args, **kwargs):
        calls.append((args, kwargs))

    monkeypatch.setattr(push_to_users, "delay", fake_delay)

    summary = send_fundraising_weekly_summary()

    assert len(summary) == 2
    totals = {(s["group__name"], s["event__name"]): s for s in summary}
    assert totals[("G1", "Fair")]["total"] == 100
    assert totals[("G2", "Fair")]["total"] == 200
    assert totals[("G1", "Fair")]["missing_evidence"] is False
    assert totals[("G2", "Fair")]["missing_evidence"] is True

    assert len(calls) == 1
    args, kwargs = calls[0]
    assert args[0] == school.id
    assert director.id in args[1]
    body = args[3]
    lines = body.splitlines()
    line_g1 = [l for l in lines if "G1" in l][0]
    line_g2 = [l for l in lines if "G2" in l][0]
    assert "falta evidencia" not in line_g1
    assert "falta evidencia" in line_g2

