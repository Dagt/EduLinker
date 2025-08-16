import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    Group,
    School,
    SchoolYear,
    SpecialistAssignment,
    User,
)


@pytest.mark.django_db(transaction=True)
def test_maestro_titular_rejected_for_unowned_group():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t1@x.com",
        email="t1@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group_own = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher
    )
    other_teacher = User.objects.create_user(
        username="t2@x.com",
        email="t2@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group_other = Group.objects.create(
        school=school, school_year=sy, name="6A", grade_level=6, homeroom_teacher=other_teacher
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.post(
        "/api/v1/events/",
        {
            "scope": "GROUP",
            "title": "X",
            "start_at": timezone.now().isoformat(),
            "end_at": (timezone.now() + timezone.timedelta(hours=1)).isoformat(),
            "group_ids": [group_other.id],
        },
        format="json",
    )
    assert res.status_code == 403


@pytest.mark.django_db(transaction=True)
def test_maestro_itinerante_rejected_without_assignment():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="it@x.com",
        email="it@x.com",
        password="p",
        role="MAESTRO_ITINERANTE",
        school=school,
    )
    group_assigned = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5
    )
    SpecialistAssignment.objects.create(
        school=school, group=group_assigned, teacher=teacher, subject="Math"
    )
    group_other = Group.objects.create(
        school=school, school_year=sy, name="6A", grade_level=6
    )

    client = APIClient()
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.post(
        "/api/v1/events/",
        {
            "scope": "GROUP",
            "title": "X",
            "start_at": timezone.now().isoformat(),
            "end_at": (timezone.now() + timezone.timedelta(hours=1)).isoformat(),
            "group_ids": [group_other.id],
        },
        format="json",
    )

    assert res.status_code == 403

