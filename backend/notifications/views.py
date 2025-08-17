from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DeviceToken, NotificationPreference
from .serializers import DeviceTokenSerializer, NotificationPreferenceSerializer

class DeviceTokenRegisterView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DeviceTokenSerializer
    queryset = DeviceToken.objects.all()

    def get_queryset(self):
        return DeviceToken.objects.filter(user=self.request.user, school_id=self.request.school_id)

class DeviceTokenListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DeviceTokenSerializer

    def get_queryset(self):
        return DeviceToken.objects.filter(user=self.request.user, school_id=self.request.school_id, active=True)

class DeviceTokenDeactivateView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DeviceTokenSerializer
    lookup_url_kwarg = "token"

    def get_object(self):
        return DeviceToken.objects.get(token=self.kwargs["token"], user=self.request.user, school_id=self.request.school_id)

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.active = False
        obj.save(update_fields=["active"])
        return Response(status=204)


class NotificationPreferenceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer

    def get_queryset(self):
        return NotificationPreference.objects.filter(
            school_id=self.request.school_id, user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(school_id=self.request.school_id, user=self.request.user)


class NotificationPreferenceDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return NotificationPreference.objects.filter(
            school_id=self.request.school_id, user=self.request.user
        )


class NotificationChannelPrefsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        prefs = {
            p.kind: p.enabled
            for p in NotificationPreference.objects.filter(
                school_id=request.school_id,
                user=request.user,
                kind__in=["push"],
            )
        }
        return Response({"push": prefs.get("push", True)})

    def put(self, request):
        if "push" in request.data:
            pref, _ = NotificationPreference.objects.get_or_create(
                school_id=request.school_id, user=request.user, kind="push"
            )
            pref.enabled = bool(request.data["push"])
            pref.save(update_fields=["enabled"])
        return self.get(request)
