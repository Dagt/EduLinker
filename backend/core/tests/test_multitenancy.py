import pytest
from django.http import JsonResponse
from django.test import RequestFactory
from rest_framework_simplejwt.tokens import RefreshToken

from core.middleware import SchoolMiddleware
from core.models import School, User


@pytest.mark.django_db
def test_subdomain_sets_school_id():
    school = School.objects.create(name="S", slug="s", subdomain="abc", active=True)
    rf = RequestFactory()
    request = rf.get("/", HTTP_HOST="abc.testserver")
    response = SchoolMiddleware(lambda req: JsonResponse({"id": req.school_id}))(request)

    assert response.status_code == 200
    assert request.school_id == school.id


@pytest.mark.django_db
def test_header_used_when_subdomain_missing():
    school = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    rf = RequestFactory()
    request = rf.get("/", HTTP_HOST="unknown.testserver", HTTP_X_SCHOOL_ID=str(school.id))
    response = SchoolMiddleware(lambda req: JsonResponse({"id": req.school_id}))(request)

    assert response.status_code == 200
    assert request.school_id == school.id


@pytest.mark.django_db
def test_invalid_header_returns_400():
    rf = RequestFactory()
    request = rf.get("/", HTTP_HOST="unknown.testserver", HTTP_X_SCHOOL_ID="bad")
    response = SchoolMiddleware(lambda req: JsonResponse({}))(request)

    assert response.status_code == 400


@pytest.mark.django_db
def test_authorization_header_sets_school_id():
    school = School.objects.create(name="S3", slug="s3", subdomain="s3", active=True)
    user = User.objects.create_user(
        username="admin@s3.com",
        email="admin@s3.com",
        password="p",
        role="ADMIN_TENANT",
        school=school,
    )
    token = str(RefreshToken.for_user(user).access_token)
    rf = RequestFactory()
    request = rf.get("/", HTTP_HOST="unknown.testserver", HTTP_AUTHORIZATION=f"Bearer {token}")
    response = SchoolMiddleware(lambda req: JsonResponse({"id": req.school_id}))(request)

    assert response.status_code == 200
    assert request.school_id == school.id
