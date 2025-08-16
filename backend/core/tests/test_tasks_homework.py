import pytest
from datetime import date, timedelta

from core.models import (
    School,
    SchoolYear,
    Group,
    Student,
    GroupMembership,
    ParentStudent,
    User,
    Homework,
)
from core.tasks import send_homework_reminders


@pytest.mark.django_db
def test_send_homework_reminders(monkeypatch, settings):
    settings.HOMEWORK_REMINDER_DAYS_AHEAD = 1

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
    student = Student.objects.create(
        school=school,
        first_name="A",
        last_name="S",
        grade_level=1,
        enrollment_code="s1",
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    parent = User.objects.create(
        username="p1", school=school, role="PADRE", email="p1@example.com"
    )
    ParentStudent.objects.create(
        school=school, parent=parent, student=student, relationship="parent"
    )

    tomorrow = date.today() + timedelta(days=1)
    Homework.objects.create(
        school=school,
        group=group,
        subject="Math",
        teacher=teacher,
        title="HW1",
        description="",
        due_date=tomorrow,
    )

    calls = []

    def fake_push_to_users(school_id, user_ids, title, body, data):
        calls.append((school_id, user_ids, title, body, data))

    monkeypatch.setattr("core.tasks.push_to_users.delay", fake_push_to_users)

    result = send_homework_reminders.run()

    assert result == {"homeworks": 1, "recipients": 2}
    assert len(calls) == 1
    assert calls[0][0] == school.id
    assert set(calls[0][1]) == {teacher.id, parent.id}
