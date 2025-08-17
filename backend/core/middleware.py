from django.http import JsonResponse
from django.db import connection

from .models import School


class SchoolMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]
        subdomain = host.split('.')[0]
        try:
            school = School.objects.get(subdomain=subdomain)
        except School.DoesNotExist:
            school_id = request.headers.get("X-School-ID")
            try:
                school = School.objects.get(pk=int(school_id))
            except (TypeError, ValueError, School.DoesNotExist):
                return JsonResponse({"detail": "Invalid tenant"}, status=400)

        connection.set_tenant(school)
        request.school_id = school.id

        response = self.get_response(request)

        connection.set_schema_to_public()
        return response
