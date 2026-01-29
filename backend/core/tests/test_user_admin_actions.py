import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from audit.models import AuditLog
from core.models import School, User


@pytest.mark.django_db(transaction=True)
def test_admin_can_deactivate_and_anonymize_user():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    admin = User.objects.create_user(
        username="admin@s.com",
        email="admin@s.com",
        password="p",
        role="ADMIN_TENANT",
        school=school,
    )
    target = User.objects.create_user(
        username="parent@s.com",
        email="parent@s.com",
        password="p",
        role="PADRE",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(admin).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    deactivate_res = client.post(f"/api/v1/users/{target.id}/deactivate/")
    assert deactivate_res.status_code == 200
    target.refresh_from_db()
    assert target.is_active is False
    assert AuditLog.objects.filter(action="deactivate", entity_id=target.id).exists()

    anonymize_res = client.post(f"/api/v1/users/{target.id}/anonymize/")
    assert anonymize_res.status_code == 200
    target.refresh_from_db()
    assert target.is_active is False
    assert target.email.startswith("deleted-")
    assert AuditLog.objects.filter(action="anonymize", entity_id=target.id).exists()


@pytest.mark.django_db(transaction=True)
def test_director_cannot_deactivate_user():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(
        username="director@s.com",
        email="director@s.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    target = User.objects.create_user(
        username="parent@s.com",
        email="parent@s.com",
        password="p",
        role="PADRE",
        school=school,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.post(f"/api/v1/users/{target.id}/deactivate/")
    assert res.status_code == 403
