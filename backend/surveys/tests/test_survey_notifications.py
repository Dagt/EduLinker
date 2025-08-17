import pytest
from datetime import timedelta
from django.utils import timezone

from core.models import School, User, Group, SchoolYear
from notifications.models import NotificationPreference
from surveys.models import Survey


@pytest.mark.django_db
def test_notify_new_survey_school(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    creator = User.objects.create(
        username="creator", school=school, role="DIRECTOR", email="c@example.com"
    )
    other = User.objects.create(
        username="other", school=school, role="DIRECTOR", email="o@example.com"
    )
    disabled = User.objects.create(
        username="dis", school=school, role="DIRECTOR", email="d@example.com"
    )
    NotificationPreference.objects.create(
        school=school, user=disabled, kind="survey", enabled=False
    )

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, set(user_ids), title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    survey = Survey.objects.create(
        school=school,
        created_by=creator,
        scope=Survey.Scope.SCHOOL,
        title="Encuesta",
        description="Desc",
        options=["a"],
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(days=1),
    )

    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == {other.id}
    assert kind == "survey"
    assert data == {"type": "survey", "survey_id": survey.id}


@pytest.mark.django_db
def test_notify_new_survey_group(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=timezone.now().date(),
        end_date=timezone.now().date() + timedelta(days=1),
        is_current=True,
    )
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
    )
    creator = User.objects.create(
        username="creator", school=school, role="DIRECTOR", email="c@example.com"
    )
    u1 = User.objects.create(
        username="u1", school=school, role="DIRECTOR", email="u1@example.com"
    )
    u2 = User.objects.create(
        username="u2", school=school, role="DIRECTOR", email="u2@example.com"
    )
    NotificationPreference.objects.create(
        school=school, user=u2, kind="survey", enabled=False
    )

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, set(user_ids), title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)
    monkeypatch.setattr(
        "surveys.signals.get_group_audience_user_ids",
        lambda school_id, gids: [creator.id, u1.id, u2.id],
    )

    survey = Survey.objects.create(
        school=school,
        created_by=creator,
        scope=Survey.Scope.GROUP,
        group=group,
        title="Encuesta",
        description="Desc",
        options=["a"],
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(days=1),
    )

    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == {u1.id}
    assert kind == "survey"
    assert data == {"type": "survey", "survey_id": survey.id}
