import pytest
from datetime import date
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    Group,
    User,
    Student,
    GroupMembership,
    ParentStudent,
)


@pytest.mark.django_db
def test_feed_shows_only_user_groups_content():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="2024", start_date=date(2024,1,1), end_date=date(2024,12,31), is_current=True)
    teacher1 = User.objects.create_user(username="t1", email="t1@example.com", password="p", role="MAESTRO_TITULAR", school=school)
    teacher2 = User.objects.create_user(username="t2", email="t2@example.com", password="p", role="MAESTRO_TITULAR", school=school)
    parent = User.objects.create_user(username="p1", email="p1@example.com", password="p", role="PADRE", school=school)
    group1 = Group.objects.create(school=school, school_year=sy, name="G1", grade_level=1, homeroom_teacher=teacher1)
    group2 = Group.objects.create(school=school, school_year=sy, name="G2", grade_level=1, homeroom_teacher=teacher2)
    student = Student.objects.create(school=school, first_name="A", last_name="S", grade_level=1, enrollment_code="s1")
    GroupMembership.objects.create(school=school, group=group1, student=student)
    ParentStudent.objects.create(school=school, parent=parent, student=student, relationship="parent")

    client = APIClient()

    t1_token = str(RefreshToken.for_user(teacher1).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {t1_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post("/api/v1/announcements/", {"group": group1.id, "title": "A1", "message": "m"}, format="json")
    assert res.status_code in (200, 201)
    res = client.post("/api/v1/homeworks/", {"group": group1.id, "subject": "Math", "title": "HW", "description": "", "due_date": date.today().isoformat()}, format="json")
    assert res.status_code in (200, 201)

    t2_token = str(RefreshToken.for_user(teacher2).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {t2_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.post("/api/v1/announcements/", {"group": group2.id, "title": "A2", "message": ""}, format="json")
    assert res.status_code in (200, 201)

    parent_token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {parent_token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get("/api/v1/feed/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    types = {item["type"] for item in data}
    assert types == {"announcement", "homework"}
    for item in data:
        assert item[item["type"]]["group"] == group1.id

    res = client.get("/api/v1/announcements/")
    assert res.status_code == 200
    assert len(res.json()) == 1
    res = client.get("/api/v1/homeworks/")
    assert res.status_code == 200
    assert len(res.json()) == 1
