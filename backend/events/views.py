from django.http import HttpResponse, HttpResponseBadRequest
from icalendar import Calendar, Event as ICalEvent
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

from core.models import Event
from core.permissions import user_can_view_event


class EventsICSView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        school_id = request.school_id
        if not school_id:
            return HttpResponseBadRequest("Missing X-SCHOOL-ID header")
        if request.user.school_id != school_id:
            raise PermissionDenied("Invalid school")

        events_qs = Event.objects.filter(school_id=school_id).filter(
            user_can_view_event(request.user)
        )

        cal = Calendar()
        cal.add("prodid", "-//EduLinker//Events//ES")
        cal.add("version", "2.0")

        for event in events_qs:
            ics_event = ICalEvent()
            ics_event.add("summary", event.title)
            ics_event.add("dtstart", event.start_at)
            ics_event.add("dtend", event.end_at)
            if event.description:
                ics_event.add("description", event.description)
            ics_event.add("uid", f"event-{event.id}@edulinker")
            cal.add_component(ics_event)

        response = HttpResponse(cal.to_ical(), content_type="text/calendar")
        response["Content-Disposition"] = 'attachment; filename="events.ics"'
        return response
