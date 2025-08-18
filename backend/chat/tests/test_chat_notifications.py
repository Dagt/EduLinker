import pytest

from chat.models import ChatMessage, GroupChat
from core.models import (
    Group,
    GroupMembership,
    ParentStudent,
    School,
    SchoolYear,
    User,
    Student,
    VocalAssignment,
)
from notifications.models import NotificationPreference


@pytest.mark.django_db
def test_notify_chat_message(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date="2023-01-01",
        end_date="2023-12-31",
        is_current=True,
    )
    teacher = User.objects.create(
        username="t1",
        school=school,
        role="MAESTRO_TITULAR",
        email="t1@example.com",
    )
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    chat = GroupChat.objects.create(group=group)

    student = Student.objects.create(
        school=school,
        first_name="A",
        last_name="S",
        grade_level=1,
        enrollment_code="E1",
    )
    GroupMembership.objects.create(school=school, group=group, student=student)

    parent_author = User.objects.create(
        username="p1",
        school=school,
        role="PADRE",
        email="p1@example.com",
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent_author,
        student=student,
        relationship="F",
    )

    parent_other = User.objects.create(
        username="p2",
        school=school,
        role="PADRE",
        email="p2@example.com",
    )
    ParentStudent.objects.create(
        school=school,
        parent=parent_other,
        student=student,
        relationship="M",
    )

    parent_vocal = User.objects.create(
        username="p3",
        school=school,
        role="PADRE",
        email="p3@example.com",
    )
    VocalAssignment.objects.create(
        school=school,
        group=group,
        parent=parent_vocal,
        assigned_by=teacher,
    )

    NotificationPreference.objects.create(
        school=school,
        user=parent_other,
        kind=NotificationPreference.Kind.CHAT,
        enabled=False,
    )

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        from notifications.tasks import _filter_user_ids_by_pref

        filtered = _filter_user_ids_by_pref(school_id, user_ids, kind)
        push_calls.append((school_id, list(filtered), title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    ChatMessage.objects.create(
        chat=chat,
        author=parent_author,
        message_text="Hola",
        author_role=parent_author.role,
    )

    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert set(user_ids) == {teacher.id, parent_vocal.id}
    assert data == {"type": "chat_message", "chat_id": chat.id}
    assert kind == NotificationPreference.Kind.CHAT
