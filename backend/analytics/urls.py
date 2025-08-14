from django.urls import path
from .views import analytics_overview

urlpatterns = [
    path("analytics/overview/", analytics_overview, name="analytics-overview"),
]
