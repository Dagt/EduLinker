# backend/notifications/urls.py (añade)
from .views import NotificationPreferenceListCreateView, NotificationPreferenceDetailView
urlpatterns += [
    path("notifications/prefs/", NotificationPreferenceListCreateView.as_view(), name="notif-prefs"),
    path("notifications/prefs/<int:pk>/", NotificationPreferenceDetailView.as_view(), name="notif-prefs-detail"),
]
