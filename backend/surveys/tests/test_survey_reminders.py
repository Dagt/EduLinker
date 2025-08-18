import pytest
from datetime import timedelta
from django.utils import timezone

from core.models import School, User
from surveys.models import Survey, SurveyVote
from core.tasks import remind_surveys_to_close


@pytest.mark.django_db
def test_reminder_excludes_users_who_already_voted(monkeypatch):
    monkeypatch.setattr("django_tenants.utils.schema_exists", lambda *a, **kw: False)
    school = School(name="S1", slug="s1", subdomain="s1")
    school.auto_create_schema = False
    school.save()
    u1 = User.objects.create(
        username="u1", school=school, role="DIRECTOR", email="u1@example.com"
    )
    u2 = User.objects.create(
        username="u2", school=school, role="DIRECTOR", email="u2@example.com"
    )

    survey = Survey.objects.create(
        school=school,
        created_by=u1,
        scope=Survey.Scope.SCHOOL,
        title="Encuesta",
        description="",
        options=["a"],
        start_at=timezone.now() - timedelta(hours=1),
        end_at=timezone.now() + timedelta(hours=1),
        status=Survey.Status.ACTIVE,
    )

    SurveyVote.objects.create(survey=survey, voter=u1, option_index=0)

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, set(user_ids), title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    result = remind_surveys_to_close()

    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert user_ids == {u2.id}
    assert result["recipients"] == 1

