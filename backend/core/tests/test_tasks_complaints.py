import pytest
from django.utils import timezone
from datetime import timedelta, date

from core.models import School, SchoolYear, User, Group, Complaint
from core.tasks import escalate_stale_complaints


@pytest.mark.django_db
def test_escalate_stale_complaints_triggers_notifications(monkeypatch, settings):
    settings.COMPLAINT_ESCALATION_DAYS = 5

    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date=date(2023,1,1),
        end_date=date(2023,12,31),
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
    push_calls: list = []

    def fake_push(*args, **kwargs):
        push_calls.append(args)

    monkeypatch.setattr("core.tasks.push_to_users.delay", fake_push)
    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    complaint = Complaint.objects.create(
        school=school,
        group=group,
        created_by=parent,
        target_teacher=teacher,
        description="Test complaint",
    )
    Complaint.objects.filter(id=complaint.id).update(
        updated_at=timezone.now() - timedelta(days=6)
    )

    # Clear calls from creation signal
    push_calls.clear()

    escalate_stale_complaints.run()
    complaint.refresh_from_db()

    assert complaint.status == Complaint.Status.ESCALATED
    assert push_calls and push_calls[0][0] == school.id
    assert list(push_calls[0][1]) == [director.id]
