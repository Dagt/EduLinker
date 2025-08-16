import pytest
from datetime import date
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    Group,
    User,
    Announcement,
    Homework,
)


@pytest.mark.django_db(transaction=True)
def test_announcements_homework_feed_visibility():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    teacher1 = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    teacher2 = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    g1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher1,
    )
    g2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G2",
        grade_level=2,
        homeroom_teacher=teacher2,
    )

    ann1 = Announcement.objects.create(
        school=school,
        group=g1,
        teacher=teacher1,
        title="A1",
        message="m",
    )
    ann2 = Announcement.objects.create(
        school=school,
        group=g2,
        teacher=teacher2,
        title="A2",
        message="x",
    )
    hw1 = Homework.objects.create(
        school=school,
        group=g1,
        subject="Math",
        teacher=teacher1,
        title="H1",
        description="",
        due_date=date.today(),
    )
    hw2 = Homework.objects.create(
        school=school,
        group=g2,
        subject="Sci",
        teacher=teacher2,
        title="H2",
        description="",
        due_date=date.today(),
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher1).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get("/api/v1/announcements/")
    assert res.status_code == 200
    ids = [item["id"] for item in res.json()]
    assert ann1.id in ids
    assert ann2.id not in ids

    res = client.get("/api/v1/homeworks/")
    assert res.status_code == 200
    ids = [item["id"] for item in res.json()]
    assert hw1.id in ids
    assert hw2.id not in ids

    res = client.get("/api/v1/feed/")
    assert res.status_code == 200
    items = res.json()
    feed_ids = {(item["type"], item["id"]) for item in items}
    assert ("announcement", ann1.id) in feed_ids
    assert ("homework", hw1.id) in feed_ids
    assert ("announcement", ann2.id) not in feed_ids
    assert ("homework", hw2.id) not in feed_ids

    res = client.post(
        "/api/v1/announcements/",
        {"group": g1.id, "title": "A3", "message": "n"},
        format="json",
    )
    assert res.status_code == 201
    assert res.json()["teacher"] == teacher1.id

    res = client.post(
        "/api/v1/homeworks/",
        {
            "group": g1.id,
            "subject": "Math",
            "title": "H3",
            "description": "",
            "due_date": date.today().isoformat(),
        },
        format="json",
    )
    assert res.status_code == 201
    assert res.json()["teacher"] == teacher1.id
