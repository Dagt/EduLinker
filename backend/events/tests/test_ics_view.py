from datetime import datetime
from types import SimpleNamespace
from unittest.mock import patch

from django.test import RequestFactory
from events.views import EventsICSView

rf = RequestFactory()


def test_events_ics_view_requires_school_header():
    request = rf.get("/events.ics")
    response = EventsICSView.as_view()(request)
    assert response.status_code == 400


def test_events_ics_view_generates_calendar():
    request = rf.get("/events.ics", HTTP_X_SCHOOL_ID="1")

    fake_event = SimpleNamespace(
        id=1,
        title="T",
        start_at=datetime(2024, 1, 1),
        end_at=datetime(2024, 1, 2),
        description="D",
    )

    with patch("events.views.Event.objects.filter", return_value=[fake_event]):
        response = EventsICSView.as_view()(request)

    assert response.status_code == 200
    assert response["Content-Type"] == "text/calendar"
    assert b"SUMMARY:T" in response.content
