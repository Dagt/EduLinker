from django.http import HttpResponse
from icalendar import Calendar, Event as ICalEvent
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from core.models import Event


class EventsICSView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        school_id = request.headers.get("X-SCHOOL-ID")
        events_qs = Event.objects.all()
        if school_id:
            events_qs = events_qs.filter(school_id=school_id)

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
