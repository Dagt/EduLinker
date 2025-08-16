import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, User
from audit.models import AuditLog


@pytest.mark.django_db
def test_teacher_cannot_access_audit_logs():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get("/api/v1/audit-logs/")
    assert res.status_code == 403


@pytest.mark.django_db
def test_director_cannot_view_other_school_audit_logs():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school1,
    )
    AuditLog.objects.create(school=school2, actor=director, action="x", entity_type="y", entity_id=1)
    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id)
    )
    res = client.get("/api/v1/audit-logs/")
    assert res.status_code == 403
