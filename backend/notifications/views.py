from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import DeviceToken
from .serializers import DeviceTokenSerializer

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
