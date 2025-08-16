from django.urls import path
from .views import (
    DeviceTokenRegisterView,
    DeviceTokenListView,
    DeviceTokenDeactivateView,
    NotificationPreferenceListCreateView,
    NotificationPreferenceDetailView,
    NotificationChannelPrefsView,
)

urlpatterns = [
    path("notifications/device-tokens/", DeviceTokenRegisterView.as_view(), name="device-token-register"),
    path("notifications/device-tokens/list/", DeviceTokenListView.as_view(), name="device-token-list"),
    path("notifications/device-tokens/<str:token>/", DeviceTokenDeactivateView.as_view(), name="device-token-deactivate"),
    path("notifications/prefs/", NotificationPreferenceListCreateView.as_view(), name="notif-prefs"),
    path("notifications/prefs/<int:pk>/", NotificationPreferenceDetailView.as_view(), name="notif-prefs-detail"),
    path("notifications/channels/", NotificationChannelPrefsView.as_view(), name="notif-channel-prefs"),
]
