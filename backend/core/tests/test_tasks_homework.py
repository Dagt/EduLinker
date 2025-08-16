import pytest
from datetime import date, timedelta

from core.tasks import send_homework_reminders
from core.models import (
    School,
    SchoolYear,
    Group,
    User,
    Student,
    GroupMembership,
    ParentStudent,
    Homework,
)


@pytest.mark.django_db
def test_send_homework_reminders(monkeypatch):
    school = School.objects.create(name="S", slug="s", subdomain="s")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )
    teacher = User.objects.create(
        username="teacher",
        school=school,
        role="MAESTRO_TITULAR",
        email="t@example.com",
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
        first_name="Stu",
        last_name="Dent",
        grade_level=1,
        enrollment_code="code",
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    parent = User.objects.create(
        username="parent",
        school=school,
        role="PADRE",
        email="p@example.com",
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent,
        student=student,
        relationship="parent",
    )

    hw_due = Homework.objects.create(
        school=school,
        group=group,
        subject="Math",
        teacher=teacher,
        title="HW1",
        description="",
        due_date=date.today() + timedelta(days=1),
    )
    Homework.objects.create(
        school=school,
        group=group,
        subject="Math",
        teacher=teacher,
        title="HW2",
        description="",
        due_date=date.today() + timedelta(days=5),
    )

    calls = []

    def fake_delay(school_id, user_ids, title, body, data=None):
        calls.append(
            {
                "school_id": school_id,
                "user_ids": user_ids,
                "title": title,
                "body": body,
                "data": data,
            }
        )

    monkeypatch.setattr("core.tasks.push_to_users.delay", fake_delay)

    result = send_homework_reminders()

    assert result == {"homeworks": 1, "recipients": 2}
    assert len(calls) == 1
    call = calls[0]
    assert call["school_id"] == school.id
    assert set(call["user_ids"]) == {teacher.id, parent.id}
    assert call["data"] == {"type": "homework", "homework_id": hw_due.id}
