from django.urls import path
from .views import DeviceTokenRegisterView, DeviceTokenListView, DeviceTokenDeactivateView

urlpatterns = [
    path("devices/register/", DeviceTokenRegisterView.as_view(), name="device-register"),
    path("devices/", DeviceTokenListView.as_view(), name="device-list"),
    path("devices/<str:token>/", DeviceTokenDeactivateView.as_view(), name="device-deactivate"),
]
