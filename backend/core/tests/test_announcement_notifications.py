from datetime import date

import pytest

from core.models import School, SchoolYear, Group, Announcement, User


@pytest.mark.django_db
def test_notify_new_announcement_group_scope(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023,1,1),
        end_date=date(2023,12,31),
        is_current=True,
    )
    teacher = User.objects.create(
        username="t1", school=school, role="MAESTRO_TITULAR", email="t1@example.com"
    )
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    parent = User.objects.create(
        username="p1", school=school, role="PADRE", email="p1@example.com"
    )

    ga_calls = []

    def fake_get_group_audience_user_ids(school_id, group_ids):
        ga_calls.append((school_id, list(group_ids)))
        return [parent.id]

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data, kind))

    monkeypatch.setattr(
        "core.signals.get_group_audience_user_ids", fake_get_group_audience_user_ids
    )
    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    ann = Announcement.objects.create(
        school=school,
        scope=Announcement.Scope.GRUPO,
        group=group,
        teacher=teacher,
        title="A1",
        message="hola",
    )

    assert ga_calls[0] == (school.id, [group.id])
    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == [parent.id]
    assert kind == "event"
    assert data == {"type": "announcement", "announcement_id": ann.id}


@pytest.mark.django_db
def test_notify_new_announcement_global_scope(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023,1,1),
        end_date=date(2023,12,31),
        is_current=True,
    )
    teacher = User.objects.create(
        username="t1", school=school, role="MAESTRO_TITULAR", email="t1@example.com"
    )
    g1 = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    g2 = Group.objects.create(
        school=school,
        school_year=year,
        name="G2",
        grade_level=1,
        homeroom_teacher=teacher,
    )

    parent1 = User.objects.create(
        username="p1", school=school, role="PADRE", email="p1@example.com"
    )
    parent2 = User.objects.create(
        username="p2", school=school, role="PADRE", email="p2@example.com"
    )

    ga_calls = []

    def fake_get_group_audience_user_ids(school_id, group_ids):
        ga_calls.append((school_id, list(group_ids)))
        return [parent1.id, parent2.id]

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data, kind))

    monkeypatch.setattr(
        "core.signals.get_group_audience_user_ids", fake_get_group_audience_user_ids
    )
    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    ann = Announcement.objects.create(
        school=school,
        scope=Announcement.Scope.GLOBAL,
        teacher=teacher,
        title="A1",
        message="hola",
    )

    assert ga_calls[0][0] == school.id
    assert set(ga_calls[0][1]) == {g1.id, g2.id}
    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == [parent1.id, parent2.id]
    assert kind == "event"
    assert data == {"type": "announcement", "announcement_id": ann.id}
