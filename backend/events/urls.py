from django.urls import path
from .views import EventsICSView

urlpatterns = [
    path("events/ics/", EventsICSView.as_view(), name="events-ics"),
]
