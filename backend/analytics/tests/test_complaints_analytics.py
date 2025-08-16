import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User, Complaint


@pytest.mark.django_db
def test_complaints_analytics_returns_totals():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
        is_current=True,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="1A",
        grade_level=1,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    # one open and one resolved complaint
    Complaint.objects.create(
        school=school,
        group=group,
        created_by=parent,
        target_teacher=teacher,
        description="d1",
        status=Complaint.Status.OPEN,
    )
    Complaint.objects.create(
        school=school,
        group=group,
        created_by=parent,
        target_teacher=teacher,
        description="d2",
        status=Complaint.Status.RESOLVED,
    )

    token = str(RefreshToken.for_user(director).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))

    res = client.get("/api/v1/analytics/complaints/")
    assert res.status_code == 200
    data = res.json()
    assert data["complaints_total"] == 2
    assert data["complaints_open"] == 1
    assert data["complaints_by_group"][0]["total"] == 2
    assert data["top_parents_by_complaints"][0]["total"] == 2
