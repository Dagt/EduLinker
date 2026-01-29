from django.http import JsonResponse
from django.db import connection
from rest_framework_simplejwt.tokens import AccessToken

from .models import School, User


class SchoolMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]
        subdomain = host.split('.')[0]
        school = None
        if subdomain:
            school = School.objects.filter(subdomain=subdomain).first()

        if not school:
            school_id = request.headers.get("X-School-ID")
            try:
                if school_id:
                    school = School.objects.get(pk=int(school_id))
            except (TypeError, ValueError, School.DoesNotExist):
                school = None

        if not school:
            auth = request.headers.get("Authorization", "")
            if auth.startswith("Bearer "):
                token = auth.split(" ", 1)[1]
                try:
                    payload = AccessToken(token)
                    user_id = payload.get("user_id")
                    if user_id:
                        user = User.objects.filter(id=user_id).first()
                        if user:
                            school = user.school
                except Exception:
                    school = None

        if not school:
            return JsonResponse({"detail": "Invalid tenant"}, status=400)

        connection.set_tenant(school)
        request.school_id = school.id

        response = self.get_response(request)

        connection.set_schema_to_public()
        return response
