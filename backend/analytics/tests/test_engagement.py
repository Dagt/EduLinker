import pytest
from datetime import date, timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    User,
    Group,
    Homework,
    Event,
    EventGroupAudience,
    Student,
    GroupMembership,
    ParentStudent,
)
from surveys.models import Survey, SurveyVote


@pytest.mark.django_db
def test_engagement_analytics_filters_by_group():
    school = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025",
        start_date="2025-01-01",
        end_date="2025-12-31",
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

    parent1 = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    parent2 = User.objects.create_user(
        username="p2@x.com",
        email="p2@x.com",
        password="p",
        role="PADRE",
        school=school,
    )

    group1 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher1,
    )
    group2 = Group.objects.create(
        school=school,
        school_year=sy,
        name="G2",
        grade_level=1,
        homeroom_teacher=teacher2,
    )

    student1 = Student.objects.create(
        school=school,
        first_name="S1",
        last_name="S1",
        grade_level=1,
        enrollment_code="S1",
    )
    student2 = Student.objects.create(
        school=school,
        first_name="S2",
        last_name="S2",
        grade_level=1,
        enrollment_code="S2",
    )
    GroupMembership.objects.create(school=school, group=group1, student=student1)
    GroupMembership.objects.create(school=school, group=group2, student=student2)
    ParentStudent.objects.create(
        school=school, parent=parent1, student=student1, relationship="P"
    )
    ParentStudent.objects.create(
        school=school, parent=parent2, student=student2, relationship="P"
    )

    now = timezone.now()
    survey1 = Survey.objects.create(
        school=school,
        created_by=teacher1,
        scope="GROUP",
        group=group1,
        title="S1",
        description="",
        options=["A"],
        is_anonymous=False,
        start_at=now,
        end_at=now + timedelta(days=1),
        status="ACTIVE",
    )
    SurveyVote.objects.create(survey=survey1, voter=parent1, option_index=0)

    survey2 = Survey.objects.create(
        school=school,
        created_by=teacher2,
        scope="GROUP",
        group=group2,
        title="S2",
        description="",
        options=["A"],
        is_anonymous=False,
        start_at=now,
        end_at=now + timedelta(days=1),
        status="ACTIVE",
    )
    SurveyVote.objects.create(survey=survey2, voter=parent2, option_index=0)

    Homework.objects.create(
        school=school,
        group=group1,
        subject="Math",
        teacher=teacher1,
        title="H1",
        description="",
        due_date=date(2025, 5, 1),
    )
    Homework.objects.create(
        school=school,
        group=group2,
        subject="Math",
        teacher=teacher2,
        title="H2",
        description="",
        due_date=date(2025, 5, 1),
    )

    start = now
    end = now + timedelta(hours=1)
    event1 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E1",
        description="",
        location="",
        start_at=start,
        end_at=end,
        created_by=teacher1,
    )
    EventGroupAudience.objects.create(event=event1, group=group1)

    event2 = Event.objects.create(
        school=school,
        school_year=sy,
        scope="GROUP",
        title="E2",
        description="",
        location="",
        start_at=start,
        end_at=end,
        created_by=teacher2,
    )
    EventGroupAudience.objects.create(event=event2, group=group2)

    client = APIClient()
    token = str(RefreshToken.for_user(director).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get(f"/api/v1/analytics/engagement/?group_id={group1.id}")
    assert res.status_code == 200
    data = res.json()

    assert data["surveys_participation"] == [{"group_id": group1.id, "total": 1}]
    assert data["homework_participation"] == [{"group_id": group1.id, "total": 1}]
    assert data["events_participation"] == [{"group_id": group1.id, "total": 1}]
    assert data["participation_rate_by_group"] == [
        {"group_id": group1.id, "rate": 1.0}
    ]

    res = client.get("/api/v1/analytics/engagement/")
    assert res.status_code == 200
    data = res.json()
    assert sorted(data["participation_rate_by_group"], key=lambda x: x["group_id"]) == [
        {"group_id": group1.id, "rate": 1.0},
        {"group_id": group2.id, "rate": 1.0},
    ]
