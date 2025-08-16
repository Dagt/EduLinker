import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    Group,
    GroupMembership,
    ParentStudent,
    School,
    SchoolYear,
    Student,
    User,
)
from chat.models import ChatMessage


@pytest.mark.django_db
def test_chat_message_with_attachment():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="cy",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    teacher = User.objects.create_user(
        username="t@x.com",
        email="t@x.com",
        password="p",
        role="MAESTRO_TITULAR",
        school=school,
    )
    group = Group.objects.create(
        school=school, school_year=sy, name="5A", grade_level=5, homeroom_teacher=teacher
    )
    student = Student.objects.create(
        school=school,
        first_name="A",
        last_name="S",
        grade_level=5,
        enrollment_code="E1",
    )
    GroupMembership.objects.create(school=school, group=group, student=student)
    parent1 = User.objects.create_user(
        username="p1@x.com",
        email="p1@x.com",
        password="p",
        role="PADRE",
        school=school,
    )
    ParentStudent.objects.create(
        school=school, parent=parent1, student=student, relationship="F"
    )

    client = APIClient()
    token1 = str(RefreshToken.for_user(parent1).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token1}", HTTP_X_SCHOOL_ID=str(school.id)
    )
    uploaded = SimpleUploadedFile("f.txt", b"hello")
    res = client.post(
        f"/api/v1/chats/{group.id}/messages/",
        {"message_text": "Hola", "author": parent1.id, "attachment": uploaded},
        format="multipart",
    )

    assert res.status_code in (200, 201)
    assert ChatMessage.objects.count() == 1
    msg = ChatMessage.objects.first()
    assert msg.message_type == "attachment"
    assert msg.attachment_url != ""
    assert msg.author_role == parent1.role
    assert res.data["message_type"] == "attachment"
    assert res.data["author_role"] == parent1.role
