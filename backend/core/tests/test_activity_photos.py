import pytest
from datetime import date
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    User,
    Group,
    Homework,
    ActivityPhoto,
)


@pytest.mark.django_db(transaction=True)
def test_activity_photos_filtered_by_group():
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
    hw = Homework.objects.create(
        school=school,
        group=g1,
        subject="Math",
        teacher=teacher1,
        title="H1",
        description="",
        due_date=date.today(),
    )
    ap1 = ActivityPhoto.objects.create(
        school=school,
        group=g1,
        uploaded_by=teacher1,
        photo_url="http://photo1",
    )
    ap2 = ActivityPhoto.objects.create(
        school=school,
        homework=hw,
        uploaded_by=teacher1,
        photo_url="http://photo2",
    )
    ActivityPhoto.objects.create(
        school=school,
        group=g2,
        uploaded_by=teacher2,
        photo_url="http://photo3",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher1).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get(f"/api/v1/groups/{g1.id}/activity-photos/")
    assert res.status_code == 200
    ids = [item["id"] for item in res.json()]
    assert ap1.id in ids
    assert ap2.id in ids
    assert len(ids) == 2

    res = client.get(f"/api/v1/groups/{g2.id}/activity-photos/")
    assert res.status_code == 200
    ids = [item["id"] for item in res.json()]
    assert ap1.id not in ids
    assert ap2.id not in ids
