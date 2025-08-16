from django.urls import path

from .views import (
    OverviewAnalyticsView,
    ComplaintsAnalyticsView,
    FundraisingAnalyticsView,
    EngagementAnalyticsView,
)

app_name = "analytics"

urlpatterns = [
    path(
        "analytics/overview/",
        OverviewAnalyticsView.as_view(),
        name="analytics-overview",
    ),
    path(
        "analytics/complaints/",
        ComplaintsAnalyticsView.as_view(),
        name="analytics-complaints",
    ),
    path(
        "analytics/fundraising/",
        FundraisingAnalyticsView.as_view(),
        name="analytics-fundraising",
    ),
    path(
        "analytics/engagement/",
        EngagementAnalyticsView.as_view(),
        name="analytics-engagement",
    ),
]
