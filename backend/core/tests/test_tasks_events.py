import pytest
from datetime import timedelta
from django.utils import timezone

from core.models import School, SchoolYear, User, Event
from core.tasks import send_event_reminders


@pytest.mark.django_db
def test_send_event_reminders_with_offsets(monkeypatch, settings):
    settings.EVENT_REMINDER_OFFSETS = [24, 1]

    fixed_now = timezone.now()
    monkeypatch.setattr(timezone, "now", lambda: fixed_now)

    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=fixed_now.date(),
        end_date=fixed_now.date() + timedelta(days=1),
        is_current=True,
    )
    creator = User.objects.create(
        username="u1", school=school, role="DIRECTOR", email="u1@example.com"
    )

    Event.objects.create(
        school=school,
        school_year=year,
        scope="GLOBAL",
        title="E1",
        start_at=fixed_now + timedelta(hours=24),
        end_at=fixed_now + timedelta(hours=25),
        created_by=creator,
    )

    Event.objects.create(
        school=school,
        school_year=year,
        scope="GLOBAL",
        title="E2",
        start_at=fixed_now + timedelta(hours=1),
        end_at=fixed_now + timedelta(hours=2),
        created_by=creator,
    )

    # Event outside offsets
    Event.objects.create(
        school=school,
        school_year=year,
        scope="GLOBAL",
        title="E3",
        start_at=fixed_now + timedelta(hours=72),
        end_at=fixed_now + timedelta(hours=73),
        created_by=creator,
    )

    calls = []

    def fake_push_to_users(school_id, user_ids, title, body, data):
        calls.append((school_id, user_ids, title, body, data))

    monkeypatch.setattr("core.tasks.push_to_users.delay", fake_push_to_users)

    result = send_event_reminders.run()

    assert result == {"events": 2, "recipients": 2}
    assert len(calls) == 2
    assert all(call[0] == school.id for call in calls)
    assert all(call[1] == [creator.id] for call in calls)
