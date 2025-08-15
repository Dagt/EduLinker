import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User, Group, Student, ParentStudent, GroupMembership
from chat.models import ChatMessage


@pytest.mark.django_db
def test_chat_message_permissions():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(school=school, name="cy", start_date="2025-08-01", end_date="2026-07-01", is_current=True)
    teacher = User.objects.create_user(username="t@x.com", email="t@x.com", password="p", role="MAESTRO_TITULAR", school=school)
    group = Group.objects.create(school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher)
    student = Student.objects.create(school=school, first_name="A", last_name="S", grade_level=5, enrollment_code="E1")
    GroupMembership.objects.create(school=school, group=group, student=student)
    parent1 = User.objects.create_user(username="p1@x.com", email="p1@x.com", password="p", role="PADRE", school=school)
    ParentStudent.objects.create(school=school, parent=parent1, student=student, relationship="F")
    parent2 = User.objects.create_user(username="p2@x.com", email="p2@x.com", password="p", role="PADRE", school=school)

    client = APIClient()

    token1 = str(RefreshToken.for_user(parent1).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token1}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get(f"/api/v1/chats/{group.id}/messages/")
    assert res.status_code == 200

    res = client.post(
        f"/api/v1/chats/{group.id}/messages/",
        {"message_text": "Hola", "author": parent1.id},
        format="json",
    )
    assert res.status_code in (200, 201)
    assert ChatMessage.objects.count() == 1

    token2 = str(RefreshToken.for_user(parent2).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token2}", HTTP_X_SCHOOL_ID=str(school.id))
    res = client.get(f"/api/v1/chats/{group.id}/messages/")
    assert res.status_code == 403
    res = client.post(
        f"/api/v1/chats/{group.id}/messages/",
        {"message_text": "Hola", "author": parent2.id},
        format="json",
    )
    assert res.status_code == 403
    assert ChatMessage.objects.count() == 1
