import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from core.models import School, SchoolYear, User, Event
from core.views import EventCancelView


@pytest.mark.django_db
def test_notify_new_event(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=timezone.now().date(),
        end_date=(timezone.now() + timedelta(days=1)).date(),
        is_current=True,
    )
    creator = User.objects.create(
        username="t1", school=school, role="DIRECTOR", email="t1@example.com"
    )
    parent = User.objects.create(
        username="p1", school=school, role="PADRE", email="p1@example.com"
    )

    ga_calls = []

    def fake_get_event_audience_user_ids(event):
        ga_calls.append(event.id)
        return [parent.id]

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data, kind))

    monkeypatch.setattr(
        "core.signals.get_event_audience_user_ids", fake_get_event_audience_user_ids
    )
    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    now = timezone.now()
    ev = Event.objects.create(
        school=school,
        school_year=year,
        scope=Event.Scope.GLOBAL,
        title="Fiesta",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=creator,
    )

    assert ga_calls == [ev.id]
    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == [parent.id]
    assert data == {"type": "event", "event_id": ev.id}
    assert kind == "event"


@pytest.mark.django_db
def test_notify_event_cancelled(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=timezone.now().date(),
        end_date=(timezone.now() + timedelta(days=1)).date(),
        is_current=True,
    )
    creator = User.objects.create(
        username="t1", school=school, role="DIRECTOR", email="t1@example.com"
    )
    parent = User.objects.create(
        username="p1", school=school, role="PADRE", email="p1@example.com"
    )

    ga_calls = []

    def fake_get_event_audience_user_ids(event):
        ga_calls.append(event.id)
        return [parent.id]

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data, kind))

    monkeypatch.setattr(
        "core.views.get_event_audience_user_ids", fake_get_event_audience_user_ids
    )
    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    now = timezone.now()
    ev = Event.objects.create(
        school=school,
        school_year=year,
        scope=Event.Scope.GLOBAL,
        title="Fiesta",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=creator,
    )

    factory = APIRequestFactory()
    request = factory.patch("/", {})
    request.user = creator
    request.school_id = school.id
    response = EventCancelView.as_view()(request, pk=ev.id)

    assert response.status_code == 200
    assert ga_calls == [ev.id]
    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == [parent.id]
    assert data == {"type": "event_cancelled", "event_id": ev.id}
