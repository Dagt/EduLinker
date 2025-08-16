from django.urls import path
from .views import (
    analytics_overview,
    analytics_complaints,
    analytics_fundraising,
    analytics_engagement,
)

urlpatterns = [
    path("analytics/overview/", analytics_overview, name="analytics-overview"),
    path("analytics/complaints/", analytics_complaints, name="analytics-complaints"),
    path("analytics/fundraising/", analytics_fundraising, name="analytics-fundraising"),
    path("analytics/engagement/", analytics_engagement, name="analytics-engagement"),
]
