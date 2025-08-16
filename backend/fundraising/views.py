from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db.models import Sum
from decimal import Decimal
from core.permissions import (
    IsDirector,
    can_record_fundraising_ledger,
    can_upload_expense,
)
from .models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence
from .serializers import FundraisingEventSerializer, FundraisingGroupLedgerSerializer, ExpenseEvidenceSerializer
from core.models import SchoolYear

class FundraisingEventListCreateView(generics.ListCreateAPIView):
    serializer_class = FundraisingEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def get_queryset(self):
        return FundraisingEvent.objects.filter(school_id=self.request.school_id)

    def perform_create(self, serializer):
        school_year = SchoolYear.objects.filter(
            school_id=self.request.school_id, is_current=True
        ).first()
        serializer.save(school_id=self.request.school_id, school_year=school_year)


class FundraisingEventSummaryView(generics.RetrieveAPIView):
    queryset = FundraisingEvent.objects.all()
    serializer_class = FundraisingEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FundraisingEvent.objects.filter(school_id=self.request.school_id)

    def retrieve(self, request, *args, **kwargs):
        event = self.get_object()
        ledgers = (
            FundraisingGroupLedger.objects.filter(event=event)
            .values("group_id", "group__name")
            .annotate(total=Sum("amount_collected"))
        )
        expenses = ExpenseEvidence.objects.filter(ledger__event=event)
        total = sum(l["total"] for l in ledgers)
        total = Decimal(total).quantize(Decimal("0.00"))
        data = {
            "event": FundraisingEventSerializer(event).data,
            "ledgers": list(ledgers),
            "total_collected": str(total),
            "expenses": ExpenseEvidenceSerializer(expenses, many=True).data,
        }
        return Response(data)

class FundraisingLedgerCreateView(generics.CreateAPIView):
    serializer_class = FundraisingGroupLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        group = serializer.validated_data.get("group")
        user = self.request.user
        if not can_record_fundraising_ledger(user, group):
            raise PermissionDenied("Not allowed to record ledger for this group")
        ledger = serializer.save(created_by=user)
        from audit.models import AuditLog
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="create",
            entity_type="fundraising_ledger",
            entity_id=ledger.id,
            metadata={"amount_collected": str(ledger.amount_collected)},
        )

class ExpenseEvidenceCreateView(generics.CreateAPIView):
    serializer_class = ExpenseEvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        ledger = serializer.validated_data.get("ledger")
        group = serializer.validated_data.get("group") or (ledger.group if ledger else None)
        user = self.request.user
        if not can_upload_expense(user, group):
            raise PermissionDenied("Not allowed to upload expenses for this group")
        serializer.save(uploader=user)
