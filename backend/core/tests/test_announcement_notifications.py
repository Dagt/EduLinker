import pytest
from datetime import date

from core.models import (
    Announcement,
    Group,
    GroupMembership,
    ParentStudent,
    School,
    SchoolYear,
    Student,
    User,
)
from core.utils import get_group_audience_user_ids


@pytest.mark.django_db
def test_group_announcement_sends_push(monkeypatch):
    school = School.objects.create(name="S", slug="s", subdomain="s")
    year = SchoolYear.objects.create(
        school=school,
        name="2024",
        start_date=date.today(),
        end_date=date.today(),
        is_current=True,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
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
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=1,
        enrollment_code="E1",
    )
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="tutor"
    )

    expected_ids = get_group_audience_user_ids(school.id, [group.id])

    calls: list[tuple] = []

    def fake_delay(school_id, user_ids, title, body, data, kind=None):
        calls.append((school_id, user_ids, title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_delay)

    ann = Announcement.objects.create(
        school=school,
        scope=Announcement.Scope.GRUPO,
        group=group,
        teacher=teacher,
        title="Aviso",
        message="Hola",
    )

    assert len(calls) == 1
    school_id, user_ids, title, body, data, kind = calls[0]
    assert school_id == school.id
    assert sorted(user_ids) == sorted(expected_ids)
    assert title == "Aviso"
    assert body == "Hola"
    assert data == {"type": "announcement", "announcement_id": ann.id}
    assert kind == "event"


@pytest.mark.django_db
def test_global_announcement_sends_push(monkeypatch):
    school = School.objects.create(name="S", slug="s", subdomain="s")
    year = SchoolYear.objects.create(
        school=school,
        name="2024",
        start_date=date.today(),
        end_date=date.today(),
        is_current=True,
    )
    director = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
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
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    student = Student.objects.create(
        school=school,
        first_name="Stu",
        last_name="Dent",
        grade_level=1,
        enrollment_code="E1",
    )
    group1 = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher1,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=year,
        name="G2",
        grade_level=2,
        homeroom_teacher=teacher2,
    )
    GroupMembership.objects.create(school=school, group=group1, student=student)
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="tutor"
    )

    expected_ids = get_group_audience_user_ids(school.id, [group1.id, group2.id])

    calls: list[tuple] = []

    def fake_delay(school_id, user_ids, title, body, data, kind=None):
        calls.append((school_id, user_ids, title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_delay)

    ann = Announcement.objects.create(
        school=school,
        scope=Announcement.Scope.GLOBAL,
        teacher=teacher1,
        title="Aviso G",
        message="Global",
    )

    assert len(calls) == 1
    school_id, user_ids, title, body, data, kind = calls[0]
    assert school_id == school.id
    assert sorted(user_ids) == sorted(expected_ids)
    assert title == "Aviso G"
    assert body == "Global"
    assert data == {"type": "announcement", "announcement_id": ann.id}
    assert kind == "event"
