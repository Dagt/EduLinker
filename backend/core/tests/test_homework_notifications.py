import pytest
from datetime import date

from core.models import (
    Group,
    GroupMembership,
    Homework,
    ParentStudent,
    School,
    SchoolYear,
    Student,
    User,
)


@pytest.mark.django_db
def test_notify_new_homework(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
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
    student = Student.objects.create(
        school=school,
        first_name="A",
        last_name="B",
        grade_level=1,
        enrollment_code="E1",
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="P"
    )

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    hw = Homework.objects.create(
        school=school,
        group=group,
        subject="Math",
        teacher=teacher,
        title="HW1",
        description="",
        due_date=date(2023, 1, 10),
    )

    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert set(user_ids) == {parent.id, teacher.id}
    assert kind == "homework"
    assert data == {"homework_id": hw.id}
