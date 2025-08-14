# backend/core/urls.py
from django.urls import path
from .storage_views import PresignUploadView
from .views import (
    ComplaintCreateView, ComplaintDetailView, ComplaintMessageCreateView, ComplaintStatusUpdateView,
    EventAttachmentCreateView, EventCancelView, EventPhotoCreateView, EventListCreateView,
    ActivityPhotoCreateView, GroupListView, MeView,
    EventDetailView, EventUpdateView,  # <- añadidas en el paso calendario anterior
)

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("groups/", GroupListView.as_view(), name="group-list"),
    path("complaints/", ComplaintCreateView.as_view(), name="complaint-create"),
    path("complaints/<int:pk>/", ComplaintDetailView.as_view(), name="complaint-detail"),
    path("complaints/<int:pk>/messages/", ComplaintMessageCreateView.as_view(), name="complaint-add-message"),
    path("complaints/<int:pk>/status/", ComplaintStatusUpdateView.as_view(), name="complaint-status"),
    path("events/", EventListCreateView.as_view(), name="event-list-create"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("events/<int:pk>/edit/", EventUpdateView.as_view(), name="event-update"),
    path("events/<int:pk>/cancel/", EventCancelView.as_view(), name="event-cancel"),
    path("events/<int:pk>/attachments/", EventAttachmentCreateView.as_view(), name="event-attachment-create"),
    path("events/<int:pk>/photos/", EventPhotoCreateView.as_view(), name="event-photo-create"),
    path("activity-photos/", ActivityPhotoCreateView.as_view(), name="activity-photo-create"),
    path("storage/presign-upload/", PresignUploadView.as_view(), name="presign-upload"),
]

