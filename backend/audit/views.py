from datetime import datetime

from django.db.models import Q
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import AuditLog
from .serializers import AuditLogSerializer
from core.permissions import IsDirector
from core.pagination import DefaultPagination


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]
    pagination_class = DefaultPagination

    def get_queryset(self):
        if self.request.user.school_id != self.request.school_id:
            raise PermissionDenied("Invalid school")

        qs = AuditLog.objects.filter(school_id=self.request.school_id)

        actor = self.request.query_params.get("actor")
        action = self.request.query_params.get("action")
        entity_type = self.request.query_params.get("entity_type")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if actor:
            actor_filter = Q(actor__username__icontains=actor) | Q(
                actor__email__icontains=actor
            )
            try:
                actor_id = int(actor)
                actor_filter |= Q(actor__id=actor_id)
            except (TypeError, ValueError):
                pass
            qs = qs.filter(actor_filter)

        if action:
            qs = qs.filter(action__icontains=action)

        if entity_type:
            qs = qs.filter(entity_type__icontains=entity_type)

        if date_from:
            start = parse_datetime(date_from) or parse_date(date_from)
            if isinstance(start, datetime):
                qs = qs.filter(created_at__gte=start)
            elif start:
                qs = qs.filter(created_at__date__gte=start)

        if date_to:
            end = parse_datetime(date_to) or parse_date(date_to)
            if isinstance(end, datetime):
                qs = qs.filter(created_at__lte=end)
            elif end:
                qs = qs.filter(created_at__date__lte=end)

        return qs
