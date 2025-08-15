from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import AuditLog
from .serializers import AuditLogSerializer
from core.permissions import is_director

class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not is_director(user):
            raise PermissionDenied("Only directors can view audit logs")
        return AuditLog.objects.filter(school_id=self.request.school_id)
