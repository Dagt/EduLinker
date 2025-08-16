import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, User
from notifications.models import DeviceToken


@pytest.mark.django_db
def test_deactivate_token_wrong_school():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    user = User.objects.create_user(
        username="u@x.com",
        email="u@x.com",
        password="p",
        role="PADRE",
        school=school1,
    )
    token_obj = DeviceToken.objects.create(
        school=school1, user=user, token="abc", platform="ios"
    )
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school2.id)
    )
    res = client.delete(f"/api/v1/notifications/device-tokens/{token_obj.token}/")
    assert res.status_code == 404
