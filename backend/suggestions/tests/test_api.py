import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User


@pytest.mark.django_db
def test_full_suggestion_flow():
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
    parent1 = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    parent2 = User.objects.create_user(
        username="p2@x.com",
        email="p2@x.com",
        password="p",
        role="PADRE",
        school=school,
    )

    client = APIClient()

    # Parent1 creates suggestion
    token1 = str(RefreshToken.for_user(parent1).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token1}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.post(
        "/api/v1/suggestions/",
        {
            "group": group.id,
            "target_teacher": teacher.id,
            "title": "Idea",
            "description": "Excursions",
        },
        format="json",
    )
    assert res.status_code in (200, 201)
    suggestion_id = res.json()["id"]

    # Parent1 list shows suggestion
    res = client.get("/api/v1/suggestions/")
    assert res.status_code == 200
    assert len(res.json()) == 1

    # Parent2 list is empty
    token2 = str(RefreshToken.for_user(parent2).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token2}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get("/api/v1/suggestions/")
    assert res.status_code == 200
    assert res.json() == []

    # Parent2 cannot retrieve or update
    res = client.get(f"/api/v1/suggestions/{suggestion_id}/")
    assert res.status_code == 403
    res = client.patch(
        f"/api/v1/suggestions/{suggestion_id}/",
        {"title": "New"},
        format="json",
    )
    assert res.status_code == 403

    # Parent1 can retrieve and update
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token1}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    res = client.get(f"/api/v1/suggestions/{suggestion_id}/")
    assert res.status_code == 200
    res = client.patch(
        f"/api/v1/suggestions/{suggestion_id}/",
        {"title": "New title"},
        format="json",
    )
    assert res.status_code == 200
    assert res.json()["title"] == "New title"
