from django.http import JsonResponse


class SchoolMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        school_id = request.META.get('HTTP_X_SCHOOL_ID')
        if not school_id:
            return JsonResponse({'detail': 'X-School-ID header missing'}, status=400)
        request.school_id = school_id
        return self.get_response(request)
