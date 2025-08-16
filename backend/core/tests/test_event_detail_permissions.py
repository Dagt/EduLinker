import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta

from core.models import School, SchoolYear, Group, User, Event, EventGroupAudience


@pytest.mark.django_db
def test_event_detail_respects_visibility():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    teacher1 = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    teacher2 = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher1,
    )
    now = timezone.now()
    event = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="G1 Event",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher1,
    )
    EventGroupAudience.objects.create(event=event, group=group1)

    token2 = str(RefreshToken.for_user(teacher2).access_token)
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token2}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/events/{event.id}/")
    assert res.status_code == 404

    token1 = str(RefreshToken.for_user(teacher1).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token1}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/events/{event.id}/")
    assert res.status_code == 200
    assert res.json()["id"] == event.id
