import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User
from audit.models import AuditLog


def setup_environment():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    SchoolYear.objects.create(
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
    return school, director, client


def create_event(client):
    res = client.post(
        "/api/v1/events/",
        {
            "scope": "GLOBAL",
            "title": "Reunion",
            "description": "",
            "location": "",
            "start_at": "2025-09-01T10:00:00Z",
            "end_at": "2025-09-01T11:00:00Z",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    return res.json()["id"]


@pytest.mark.django_db
def test_event_create_logged():
    school, director, client = setup_environment()
    event_id = create_event(client)
    assert AuditLog.objects.filter(
        school=school,
        actor=director,
        action="event_create",
        entity_type="event",
        entity_id=event_id,
    ).exists()


@pytest.mark.django_db
def test_event_update_logged():
    school, director, client = setup_environment()
    event_id = create_event(client)
    res = client.patch(
        f"/api/v1/events/{event_id}/edit/",
        {"title": "Actualizado"},
        format="json",
    )
    assert res.status_code == 200
    log = AuditLog.objects.filter(action="event_update", entity_type="event", entity_id=event_id).first()
    assert log is not None
    assert log.metadata["changes"]["title"]["to"] == "Actualizado"


@pytest.mark.django_db
def test_event_cancel_logged():
    school, director, client = setup_environment()
    event_id = create_event(client)
    res = client.patch(f"/api/v1/events/{event_id}/cancel/", {}, format="json")
    assert res.status_code == 200
    assert AuditLog.objects.filter(action="event_cancel", entity_type="event", entity_id=event_id).exists()


@pytest.mark.django_db
def test_event_attachment_upload_logged():
    school, director, client = setup_environment()
    event_id = create_event(client)
    res = client.post(
        f"/api/v1/events/{event_id}/attachments/",
        {
            "file_url": "https://example.com/f.pdf",
            "filename": "f.pdf",
            "mime": "application/pdf",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    attachment_id = res.json()["id"]
    log = AuditLog.objects.filter(action="event_attachment_upload", entity_type="event", entity_id=event_id).first()
    assert log is not None
    assert log.metadata["attachment_id"] == attachment_id


@pytest.mark.django_db
def test_event_photo_upload_logged():
    school, director, client = setup_environment()
    event_id = create_event(client)
    res = client.post(
        f"/api/v1/events/{event_id}/photos/",
        {
            "photo_url": "https://example.com/p.jpg",
            "caption": "Foto",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    photo_id = res.json()["id"]
    log = AuditLog.objects.filter(action="event_photo_upload", entity_type="event", entity_id=event_id).first()
    assert log is not None
    assert log.metadata["photo_id"] == photo_id
