import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, User
from notifications.models import DeviceToken, NotificationPreference


@pytest.mark.django_db
def test_notification_pref_crud_and_token_deactivation():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(username="u@x.com", email="u@x.com", password="p", role="PADRE", school=school)

    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    DeviceToken.objects.create(school=school, user=user, token="abc", platform="web")

    res = client.get("/api/v1/notifications/device-tokens/list/")
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = client.delete("/api/v1/notifications/device-tokens/abc/")
    assert res.status_code == 204
    assert DeviceToken.objects.get(token="abc").active is False

    res = client.post(
        "/api/v1/notifications/prefs/",
        {"kind": NotificationPreference.Kind.EVENT},
        format="json",
    )
    assert res.status_code in (200, 201)
    pref_id = res.json()["id"]

    res = client.get("/api/v1/notifications/prefs/")
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = client.patch(
        f"/api/v1/notifications/prefs/{pref_id}/",
        {"enabled": False},
        format="json",
    )
    assert res.status_code == 200
    assert res.json()["enabled"] is False
    assert NotificationPreference.objects.get(id=pref_id).enabled is False
