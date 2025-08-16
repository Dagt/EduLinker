from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from core.permissions import IsDirector

class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def get_queryset(self):
        return AuditLog.objects.filter(school_id=self.request.school_id)
