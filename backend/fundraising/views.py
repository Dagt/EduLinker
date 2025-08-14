from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from core.permissions import is_director, is_maestro_titular, is_vocal
from .models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence
from .serializers import FundraisingEventSerializer, FundraisingGroupLedgerSerializer, ExpenseEvidenceSerializer
from core.models import SchoolYear, VocalAssignment

class FundraisingEventListCreateView(generics.ListCreateAPIView):
    serializer_class = FundraisingEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FundraisingEvent.objects.filter(school_id=self.request.school_id)

    def perform_create(self, serializer):
        user = self.request.user
        if not is_director(user):
            raise PermissionDenied("Only directors can create fundraising events")
        school_year = SchoolYear.objects.filter(school_id=self.request.school_id, is_current=True).first()
        serializer.save(school_id=self.request.school_id, school_year=school_year)

class FundraisingLedgerCreateView(generics.CreateAPIView):
    serializer_class = FundraisingGroupLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        group = serializer.validated_data.get("group")
        user = self.request.user
        if not (
            is_director(user)
            or (is_maestro_titular(user) and group.homeroom_teacher_id == user.id)
            or (is_vocal(user) and VocalAssignment.objects.filter(group=group, parent=user, active=True).exists())
        ):
            raise PermissionDenied("Not allowed to record ledger for this group")
        serializer.save(created_by=user)

class ExpenseEvidenceCreateView(generics.CreateAPIView):
    serializer_class = ExpenseEvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        ledger = serializer.validated_data.get("ledger")
        group = serializer.validated_data.get("group") or (ledger.group if ledger else None)
        user = self.request.user
        if not (is_vocal(user) and VocalAssignment.objects.filter(group=group, parent=user, active=True).exists()):
            raise PermissionDenied("Not allowed to upload expenses for this group")
        serializer.save(uploader=user)
