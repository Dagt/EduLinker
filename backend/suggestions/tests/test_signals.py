import pytest
from datetime import date

from core.models import Group, School, SchoolYear, User
from suggestions.models import Suggestion, SuggestionMessage


@pytest.mark.django_db
def test_notify_new_suggestion(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )
    director = User.objects.create(
        username="d1", school=school, role="DIRECTOR", email="d1@example.com", phone="123"
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

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    suggestion = Suggestion.objects.create(
        school=school,
        group=group,
        created_by=parent,
        target_teacher=teacher,
        title="S1",
        description="Desc",
    )

    assert push_calls
    school_id, user_ids, title, body, data = push_calls[0]
    assert school_id == school.id
    assert set(user_ids) == {teacher.id, director.id}
    assert data == {"type": "suggestion", "suggestion_id": suggestion.id}


@pytest.mark.django_db
def test_notify_new_suggestion_message(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=True,
    )
    director = User.objects.create(
        username="d1", school=school, role="DIRECTOR", email="d1@example.com", phone="123"
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

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    suggestion = Suggestion.objects.create(
        school=school,
        group=group,
        created_by=parent,
        target_teacher=teacher,
        title="S1",
        description="Desc",
    )

    push_calls.clear()

    SuggestionMessage.objects.create(
        suggestion=suggestion,
        author=teacher,
        message="Hi",
    )

    assert push_calls
    school_id, user_ids, title, body, data = push_calls[0]
    assert school_id == school.id
    # Recipients: parent (created_by) and director; teacher is sender excluded
    assert set(user_ids) == {parent.id, director.id}
    assert data == {"type": "suggestion_message", "suggestion_id": suggestion.id}
