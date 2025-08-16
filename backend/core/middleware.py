from django.http import JsonResponse

from .models import School


class SchoolMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]
        parts = host.split('.')
        school = None

        if parts and parts[0]:
            subdomain = parts[0]
            school = School.objects.filter(subdomain=subdomain).first()
            if school:
                request.school_id = school.id

        if not school:
            school_id = request.META.get("HTTP_X_SCHOOL_ID")
            if not school_id:
                return JsonResponse({"detail": "X-School-ID header missing"}, status=400)
            try:
                request.school_id = int(school_id)
            except (TypeError, ValueError):
                return JsonResponse({"detail": "Invalid X-School-ID"}, status=400)

        return self.get_response(request)
