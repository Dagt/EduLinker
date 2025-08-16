import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, Group, User, VocalAssignment
from surveys.models import Survey, SurveyVote


@pytest.mark.django_db
def test_survey_results_permissions_and_counts():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025-2026",
        start_date="2025-08-01",
        end_date="2026-07-01",
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
    vocal = User.objects.create_user(
        username="v@x.com",
        email="v@x.com",
        password="p",
        role="VOCAL",
        school=school,
    )
    parent = User.objects.create_user(
        username="p@x.com",
        email="p@x.com",
        password="p",
        role="PADRE",
        school=school,
    )

    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=teacher,
    )
    VocalAssignment.objects.create(
        school=school, group=group, parent=vocal, assigned_by=director, active=True
    )

    now = timezone.now()
    survey = Survey.objects.create(
        school=school,
        created_by=teacher,
        scope=Survey.Scope.GROUP,
        group=group,
        title="T",
        description="",
        options=["A", "B"],
        is_anonymous=False,
        start_at=now,
        end_at=now + timedelta(days=1),
        status=Survey.Status.ACTIVE,
    )
    SurveyVote.objects.create(survey=survey, voter=teacher, option_index=0)
    SurveyVote.objects.create(survey=survey, voter=vocal, option_index=0)
    SurveyVote.objects.create(survey=survey, voter=director, option_index=1)

    client = APIClient()

    # Director (not creator) can view results and see counts
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get(f"/api/v1/surveys/{survey.id}/results/")
    assert res.status_code == 200
    assert res.json()["results"] == {"0": 2, "1": 1}

    # Creator teacher can view
    token = str(RefreshToken.for_user(teacher).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get(f"/api/v1/surveys/{survey.id}/results/")
    assert res.status_code == 200

    # Vocal parent can view
    token = str(RefreshToken.for_user(vocal).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get(f"/api/v1/surveys/{survey.id}/results/")
    assert res.status_code == 200

    # Regular parent cannot view
    token = str(RefreshToken.for_user(parent).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get(f"/api/v1/surveys/{survey.id}/results/")
    assert res.status_code == 403
