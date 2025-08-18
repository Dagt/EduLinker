import pytest

from core.models import School, SchoolYear, Group, User, Complaint, ComplaintParticipant


@pytest.mark.django_db
def test_notify_complaint_status_changed(monkeypatch):
    school = School.objects.create(name="S1", slug="s1", subdomain="s1")
    year = SchoolYear.objects.create(
        school=school,
        name="2023",
        start_date="2023-01-01",
        end_date="2023-12-31",
        is_current=True,
    )
    teacher = User.objects.create(username="t1", school=school, role="MAESTRO_TITULAR")
    director = User.objects.create(username="d1", school=school, role="DIRECTOR")
    author = User.objects.create(username="p1", school=school, role="PADRE")
    group = Group.objects.create(
        school=school,
        school_year=year,
        name="G1",
        grade_level=1,
        homeroom_teacher=teacher,
    )
    complaint = Complaint.objects.create(
        school=school,
        group=group,
        created_by=author,
        target_teacher=teacher,
        description="desc",
    )
    other = User.objects.create(username="o1", school=school, role="PADRE")
    ComplaintParticipant.objects.create(complaint=complaint, user=other, added_by=author)

    push_calls = []

    def fake_push(school_id, user_ids, title, body, data, kind=None):
        push_calls.append((school_id, list(user_ids), title, body, data, kind))

    monkeypatch.setattr("notifications.tasks.push_to_users.delay", fake_push)

    complaint._actor_id = director.id
    complaint.status = Complaint.Status.IN_REVIEW
    complaint.save()

    assert push_calls
    school_id, user_ids, title, body, data, kind = push_calls[0]
    assert school_id == school.id
    assert set(user_ids) == {author.id, teacher.id, other.id}
    assert kind == "complaint"
    assert data == {
        "type": "complaint_status",
        "complaint_id": complaint.id,
        "status": Complaint.Status.IN_REVIEW,
    }
