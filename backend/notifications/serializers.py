# backend/notifications/serializers.py (añade)
from .models import NotificationPreference
class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ["id","kind","enabled"]

# backend/notifications/views.py (añade)
from .models import NotificationPreference
from .serializers import NotificationPreferenceSerializer
from rest_framework import generics, permissions

class NotificationPreferenceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    def get_queryset(self):
        return NotificationPreference.objects.filter(school_id=self.request.school_id, user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(school_id=self.request.school_id, user=self.request.user)

class NotificationPreferenceDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    lookup_field = "pk"
    def get_queryset(self):
        return NotificationPreference.objects.filter(school_id=self.request.school_id, user=self.request.user)
