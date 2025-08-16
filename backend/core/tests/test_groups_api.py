import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from core.models import School, SchoolYear, User, Group, SpecialistAssignment, VocalAssignment


@pytest.mark.django_db(transaction=True)
def test_maestro_titular_cannot_create_group():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    SchoolYear.objects.create(
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

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.post(
        "/api/v1/groups/create/",
        {"name": "5A", "grade_level": 5},
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db(transaction=True)
def test_maestro_titular_cannot_assign_homeroom_teacher():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    requester = User.objects.create_user(
        username="req@x.com",
        email="req@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    new_teacher = User.objects.create_user(
        username="new@x.com",
        email="new@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(requester).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.patch(
        f"/api/v1/groups/{group.id}/assign-homeroom-teacher/",
        {"homeroom_teacher": new_teacher.id},
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db(transaction=True)
def test_maestro_titular_cannot_assign_specialist():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    requester = User.objects.create_user(
        username="req@x.com",
        email="req@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    specialist = User.objects.create_user(
        username="sp@x.com",
        email="sp@x.com",
        password="p",
        role="MAESTRO_ITINERANTE",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(requester).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.post(
        f"/api/v1/groups/{group.id}/assign-specialist/",
        {"teacher": specialist.id, "subject": "Math"},
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db(transaction=True)
def test_maestro_titular_cannot_create_vocal_assignment():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    requester = User.objects.create_user(
        username="req@x.com",
        email="req@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
    )

    client = APIClient()
    token = str(RefreshToken.for_user(requester).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.post(
        "/api/v1/groups/vocal-assignments/",
        {"group": group.id, "parent": parent.id},
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db(transaction=True)
def test_maestro_titular_cannot_deactivate_vocal_assignment():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    requester = User.objects.create_user(
        username="req@x.com",
        email="req@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
    )
    assignment = VocalAssignment.objects.create(
        school=school,
        group=group,
        parent=parent,
        assigned_by=parent,  # dummy
        start_at=timezone.now(),
    )

    client = APIClient()
    token = str(RefreshToken.for_user(requester).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.patch(
        f"/api/v1/groups/vocal-assignments/{assignment.id}/deactivate/",
        {},
        format="json",
    )
    assert res.status_code == 403
