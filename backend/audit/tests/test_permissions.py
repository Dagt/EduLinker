import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, User


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
