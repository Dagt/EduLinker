import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    Group,
    Event,
    EventGroupAudience,
    User,
    SpecialistAssignment,
    VocalAssignment,
    Student,
    GroupMembership,
    ParentStudent,
)


def _setup_base():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    other_teacher = User.objects.create_user(
        username="o@x.com",
        email="o@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=other_teacher,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G2",
        grade_level=1,
        homeroom_teacher=other_teacher,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    now = timezone.now()
    global_event = Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GLOBAL,
        title="Global",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=director,
    )
    g1_event = Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GROUP,
        title="G1",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=director,
    )
    EventGroupAudience.objects.create(event=g1_event, group=group1)
    g2_event = Event.objects.create(
        school=school,
        school_year=sy,
        scope=Event.Scope.GROUP,
        title="G2",
        start_at=now,
        end_at=now + timedelta(hours=1),
        created_by=director,
    )
    EventGroupAudience.objects.create(event=g2_event, group=group2)
    return {
        "school": school,
        "group1": group1,
        "group2": group2,
        "director": director,
        "global_event": global_event,
        "g1_event": g1_event,
        "g2_event": g2_event,
    }


def _api_client(user, school):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    return client


@pytest.mark.django_db
def test_director_sees_all_events():
    env = _setup_base()
    client = _api_client(env["director"], env["school"])
    res = client.get("/api/v1/events/")
    assert res.status_code == 200
    ids = {e["id"] for e in res.json()}
    assert ids == {
        env["global_event"].id,
        env["g1_event"].id,
        env["g2_event"].id,
    }


@pytest.mark.django_db
def test_maestro_titular_only_see_homeroom_events():
    env = _setup_base()
    user = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=env["school"],
    )
    env["group1"].homeroom_teacher = user
    env["group1"].save()
    client = _api_client(user, env["school"])
    res = client.get("/api/v1/events/")
    assert res.status_code == 200
    ids = {e["id"] for e in res.json()}
    assert ids == {env["global_event"].id, env["g1_event"].id}


@pytest.mark.django_db
def test_maestro_itinerante_only_see_assigned_events():
    env = _setup_base()
    user = User.objects.create_user(
        username="it@x.com",
        email="it@x.com",
        password="p",
        role="MAESTRO_ITINERANTE",
        school=env["school"],
    )
    SpecialistAssignment.objects.create(
        school=env["school"], group=env["group1"], teacher=user, subject="Math"
    )
    client = _api_client(user, env["school"])
    res = client.get("/api/v1/events/")
    assert res.status_code == 200
    ids = {e["id"] for e in res.json()}
    assert ids == {env["global_event"].id, env["g1_event"].id}


@pytest.mark.django_db
def test_vocal_only_see_assigned_group_events():
    env = _setup_base()
    user = User.objects.create_user(
        username="v@x.com",
        email="v@x.com",
        password="p",
        role="VOCAL",
        school=env["school"],
    )
    VocalAssignment.objects.create(
        school=env["school"],
        group=env["group1"],
        parent=user,
        assigned_by=env["director"],
    )
    client = _api_client(user, env["school"])
    res = client.get("/api/v1/events/")
    assert res.status_code == 200
    ids = {e["id"] for e in res.json()}
    assert ids == {env["global_event"].id, env["g1_event"].id}


@pytest.mark.django_db
def test_padre_only_see_children_group_events():
    env = _setup_base()
    user = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=env["school"],
    )
    student = Student.objects.create(
        school=env["school"],
        first_name="A",
        last_name="B",
        grade_level=1,
        enrollment_code="e1",
    )
    GroupMembership.objects.create(
        school=env["school"], group=env["group1"], student=student
    )
    ParentStudent.objects.create(
        school=env["school"], parent=user, student=student, relationship="P"
    )
    client = _api_client(user, env["school"])
    res = client.get("/api/v1/events/")
    assert res.status_code == 200
    ids = {e["id"] for e in res.json()}
    assert ids == {env["global_event"].id, env["g1_event"].id}

