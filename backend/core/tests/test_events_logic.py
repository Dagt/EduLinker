import pytest
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User, Group, Event, EventGroupAudience


@pytest.mark.django_db
def test_event_creation_update_and_cancel_permissions():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    director = User.objects.create_user(username="d@x.com", email="d@x.com", password="p", role="DIRECTOR", school=school)
    teacher = User.objects.create_user(username="t@x.com", email="t@x.com", password="p", role="MAESTRO_TITULAR", school=school)
    other = User.objects.create_user(username="o@x.com", email="o@x.com", password="p", role="MAESTRO_TITULAR", school=school)
    parent = User.objects.create_user(username="p@x.com", email="p@x.com", password="p", role="PADRE", school=school)
    group = Group.objects.create(school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher)

    client = APIClient()
    now = timezone.now()

    # Director can create global event
    director_token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {director_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/events/",
        {
            "scope": "GLOBAL",
            "title": "Reunion",
            "description": "All",
            "start_at": now.isoformat(),
            "end_at": (now + timedelta(hours=1)).isoformat(),
        },
        format="json",
    )
    assert res.status_code in (200, 201)

    # Parent cannot create global or group events
    parent_token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {parent_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(
        "/api/v1/events/",
        {
            "scope": "GLOBAL",
            "title": "X",
            "start_at": now.isoformat(),
            "end_at": (now + timedelta(hours=1)).isoformat(),
        },
        format="json",
    )
    assert res.status_code == 403

    res = client.post(
        "/api/v1/events/",
        {
            "scope": "GROUP",
            "title": "Y",
            "start_at": now.isoformat(),
            "end_at": (now + timedelta(hours=1)).isoformat(),
            "group_ids": [group.id],
        },
        format="json",
    )
    assert res.status_code in (400, 403)

    # Prepare a group event created by teacher
    event = Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GROUP,
        title="Clase",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=teacher,
    )
    EventGroupAudience.objects.create(event=event, group=group)
    event_id = event.id

    teacher_token = str(RefreshToken.for_user(teacher).access_token)
    # Other teacher cannot update
    other_token = str(RefreshToken.for_user(other).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.patch(
        f"/api/v1/events/{event_id}/edit/",
        {"title": "Cambio"},
        format="json",
    )
    assert res.status_code == 403

    # Director can update
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {director_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.patch(
        f"/api/v1/events/{event_id}/edit/",
        {"title": "Dir Cambio"},
        format="json",
    )
    assert res.status_code == 200

    # Parent cannot cancel
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {parent_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.patch(f"/api/v1/events/{event_id}/cancel/", {}, format="json")
    assert res.status_code == 403

    # Creator teacher can cancel
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {teacher_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.patch(f"/api/v1/events/{event_id}/cancel/", {}, format="json")
    assert res.status_code == 200
    assert res.json()["status"] == Event.Status.CANCELLED
