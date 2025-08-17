# backend/core/urls.py.py
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .storage_views import PresignUploadView
from .views import (
    ComplaintCreateView,
    ComplaintDetailView,
    ComplaintMessageCreateView,
    ComplaintParticipantCreateView,
    ComplaintStatusUpdateView,
    EventAttachmentListCreateView,
    EventCancelView,
    EventPhotoListCreateView,
    EventListCreateView,
    ActivityPhotoCreateView,
    ActivityPhotoListView,
    GroupListView,
    GroupCreateView,
    GroupMembersView,
    AssignHomeroomTeacherView,
    AssignSpecialistView,
    VocalAssignmentCreateView,
    VocalAssignmentDeactivateView,
    MeView,
    CurrentSchoolView,
    SchoolYearRolloverView,
    EventDetailView,
    EventUpdateView,
    AnnouncementListCreateView,
    AnnouncementDetailView,
    HomeworkListCreateView,
    HomeworkDetailView,
    FeedView,
)

api_docs_urlpatterns = [
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="docs",
    ),
]

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("schools/current/", CurrentSchoolView.as_view(), name="current-school"),
    path(
        "school-years/rollover/",
        SchoolYearRolloverView.as_view(),
        name="school-year-rollover",
    ),
    path("groups/", GroupListView.as_view(), name="group-list"),
    path("groups/create/", GroupCreateView.as_view(), name="group-create"),
    path(
        "groups/<int:pk>/assign-homeroom-teacher/",
        AssignHomeroomTeacherView.as_view(),
        name="group-assign-homeroom",
    ),
    path(
        "groups/<int:pk>/assign-specialist/",
        AssignSpecialistView.as_view(),
        name="group-assign-specialist",
    ),
    path(
        "groups/<int:pk>/members/",
        GroupMembersView.as_view(),
        name="group-members",
    ),
    path(
        "groups/<int:pk>/activity-photos/",
        ActivityPhotoListView.as_view(),
        name="activity-photo-list",
    ),
    path(
        "groups/vocal-assignments/",
        VocalAssignmentCreateView.as_view(),
        name="vocal-assignment-create",
    ),
    path(
        "groups/vocal-assignments/<int:pk>/deactivate/",
        VocalAssignmentDeactivateView.as_view(),
        name="vocal-assignment-deactivate",
    ),
    path("complaints/", ComplaintCreateView.as_view(), name="complaint-create"),
    path("complaints/<int:pk>/", ComplaintDetailView.as_view(), name="complaint-detail"),
    path("complaints/<int:pk>/messages/", ComplaintMessageCreateView.as_view(), name="complaint-add-message"),
    path("complaints/<int:pk>/participants/", ComplaintParticipantCreateView.as_view(), name="complaint-add-participant"),
    path("complaints/<int:pk>/status/", ComplaintStatusUpdateView.as_view(), name="complaint-status"),
    path("events/", EventListCreateView.as_view(), name="event-list-create"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("events/<int:pk>/edit/", EventUpdateView.as_view(), name="event-update"),
    path("events/<int:pk>/cancel/", EventCancelView.as_view(), name="event-cancel"),
    path(
        "events/<int:pk>/attachments/",
        EventAttachmentListCreateView.as_view(),
        name="event-attachment-list",
    ),
    path(
        "events/<int:pk>/photos/",
        EventPhotoListCreateView.as_view(),
        name="event-photo-list",
    ),
    path("activity-photos/", ActivityPhotoCreateView.as_view(), name="activity-photo-create"),
    path("announcements/", AnnouncementListCreateView.as_view(), name="announcement-list-create"),
    path("announcements/<int:pk>/", AnnouncementDetailView.as_view(), name="announcement-detail"),
    path("homeworks/", HomeworkListCreateView.as_view(), name="homework-list-create"),
    path("homeworks/<int:pk>/", HomeworkDetailView.as_view(), name="homework-detail"),
    path("feed/", FeedView.as_view(), name="feed"),
    path("storage/presign-upload/", PresignUploadView.as_view(), name="presign-upload"),
    # Included app routes
    path("", include("suggestions.urls")),
    path("", include("fundraising.urls")),
]

