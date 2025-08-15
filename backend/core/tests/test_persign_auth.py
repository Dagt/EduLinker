import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, User

@pytest.mark.django_db
def test_presign_requires_auth_and_school_header():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(username="u@x.com", email="u@x.com", password="p", role="DIRECTOR", school=school)

    client = APIClient()
    # sin auth
    res = client.post("/api/v1/storage/presign-upload/", {"filename":"x.png"}, format="json")
    assert res.status_code in (400,401,403)

    # con auth sin X-School-ID -> middleware debe rechazar
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    r2 = client.post("/api/v1/storage/presign-upload/", {"filename":"x.png"}, format="json")
    assert r2.status_code in (400,403,422)

    # con header correcto
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    r3 = client.post("/api/v1/storage/presign-upload/", {"filename":"x.png"}, format="json")
    assert r3.status_code in (200,201)
