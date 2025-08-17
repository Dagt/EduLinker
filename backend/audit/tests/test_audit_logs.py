import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User
from audit.models import AuditLog

@pytest.mark.django_db
def test_complaint_status_change_logged_and_endpoint():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    director = User.objects.create_user(username="d@x.com", email="d@x.com", password="p", role="DIRECTOR", school=school)
    teacher = User.objects.create_user(username="t@x.com", email="t@x.com", password="p", role="MAESTRO_TITULAR", school=school)
    group = Group.objects.create(school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher)
    parent = User.objects.create_user(username="p@x.com", email="p@x.com", password="p", role="PADRE", school=school)
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post("/api/v1/complaints/", {"group": group.id, "target_teacher": teacher.id, "description": "Prueba"}, format="json")
    complaint_id = res.json()["id"]
    teacher_token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {teacher_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.patch(f"/api/v1/complaints/{complaint_id}/status/", {"status": "IN_REVIEW"}, format="json")
    assert res.status_code == 200
    assert AuditLog.objects.filter(action="status_change", entity_type="complaint", entity_id=complaint_id).exists()
    director_token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {director_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get("/api/v1/audit-logs/")
    assert res.status_code == 200
    assert len(res.json()) >= 1


@pytest.mark.django_db
def test_complaint_read_logged():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    client = APIClient()
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}",
        HTTP_X_SCHOOL_ID=str(school.id),
    )
    res = client.post(
        "/api/v1/complaints/",
        {"group": group.id, "target_teacher": teacher.id, "description": "Prueba"},
        format="json",
    )
    complaint_id = res.json()["id"]
    res = client.get(f"/api/v1/complaints/{complaint_id}/")
    assert res.status_code == 200
    assert AuditLog.objects.filter(
        action="read",
        entity_type="complaint",
        entity_id=complaint_id,
        actor=parent,
    ).exists()


@pytest.mark.django_db
def test_non_director_cannot_view_audit_logs():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(
        username="t@x.com", email="t@x.com", password="p", role="MAESTRO_TITULAR", school=school
    )
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get("/api/v1/audit-logs/")
    assert res.status_code == 403

@pytest.mark.django_db
def test_event_creation_logged():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    director = User.objects.create_user(username="d@x.com", email="d@x.com", password="p", role="DIRECTOR", school=school)
    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post("/api/v1/events/", {
        "scope": "GLOBAL",
        "title": "Reunion",
        "description": "",
        "location": "",
        "start_at": "2025-09-01T10:00:00Z",
        "end_at": "2025-09-01T11:00:00Z"
    }, format="json")
    assert res.status_code in (200,201)
    event_id = res.json()["id"]
    assert AuditLog.objects.filter(action="create", entity_type="event", entity_id=event_id).exists()

@pytest.mark.django_db
def test_chat_message_logged():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    director = User.objects.create_user(username="d@x.com", email="d@x.com", password="p", role="DIRECTOR", school=school)
    group = Group.objects.create(school=school, school_year=sy, name="5A", grade_level=5)
    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post(f"/api/v1/chats/{group.id}/messages/", {"author": director.id, "message_text": "Hola"}, format="json")
    assert res.status_code in (200,201)
    msg_id = res.json()["id"]
    assert AuditLog.objects.filter(action="create", entity_type="chat_message", entity_id=msg_id).exists()
