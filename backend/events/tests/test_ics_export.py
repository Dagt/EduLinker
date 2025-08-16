import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from core.models import School, SchoolYear, User, Event
import icalendar


@pytest.mark.django_db
def test_ics_export_contains_event():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025-2026",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    user = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    now = timezone.now()
    Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GLOBAL,
        title="Fiesta",
        description="Desc",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=user,
    )

    client = APIClient()
    res = client.get("/api/v1/events/ics/", HTTP_X_SCHOOL_ID=str(school.id))
    assert res.status_code == 200
    assert res["Content-Type"] == "text/calendar"

    cal = icalendar.Calendar.from_ical(res.content)
    events = [c for c in cal.walk("VEVENT")]
    assert len(events) == 1
    assert str(events[0].get("summary")) == "Fiesta"
