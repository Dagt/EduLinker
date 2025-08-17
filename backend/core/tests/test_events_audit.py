import pytest
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import School, SchoolYear, User
from audit.models import AuditLog


@pytest.mark.django_db(transaction=True)
def test_event_audit_logs():
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

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )

    now = timezone.now()
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
    event_id = res.json()["id"]
    log = AuditLog.objects.filter(
        action="event_create", entity_type="event", entity_id=event_id
    ).first()
    assert log is not None

    res = client.patch(
        f"/api/v1/events/{event_id}/edit/",
        {"title": "Cambio"},
        format="json",
    )
    assert res.status_code == 200
    log = AuditLog.objects.filter(action="event_update", entity_id=event_id).first()
    assert log is not None
    assert log.metadata["changes"]["title"]["to"] == "Cambio"

    res = client.post(
        f"/api/v1/events/{event_id}/attachments/",
        {
            "file_url": "http://example.com/a.pdf",
            "filename": "a.pdf",
            "mime": "application/pdf",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    attachment_id = res.json()["id"]
    assert AuditLog.objects.filter(
        action="event_attachment_upload",
        entity_id=event_id,
        metadata__attachment_id=attachment_id,
    ).exists()

    res = client.post(
        f"/api/v1/events/{event_id}/photos/",
        {
            "photo_url": "http://example.com/p.jpg",
            "caption": "cap",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    photo_id = res.json()["id"]
    assert AuditLog.objects.filter(
        action="event_photo_upload",
        entity_id=event_id,
        metadata__photo_id=photo_id,
    ).exists()

    res = client.patch(
        f"/api/v1/events/{event_id}/cancel/",
        {},
        format="json",
    )
    assert res.status_code == 200
    assert AuditLog.objects.filter(action="event_cancel", entity_id=event_id).exists()
