from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db.models import Sum, Q
from decimal import Decimal
from core.permissions import (
    IsDirector,
    IsDirectorOrReadOnly,
    can_record_fundraising_ledger,
    can_upload_expense,
    is_admin_tenant,
    is_director,
    is_maestro_titular,
    is_vocal,
)
from .models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence
from .serializers import (
    FundraisingEventSerializer,
    FundraisingGroupLedgerSerializer,
    ExpenseEvidenceSerializer,
)
from core.throttles import EventCreateThrottle
from core.models import SchoolYear, Group, VocalAssignment


def _user_group_ids(user, school_id):
    if is_admin_tenant(user) or is_director(user):
        return Group.objects.filter(school_id=school_id).values_list("id", flat=True)
    if is_maestro_titular(user):
        return Group.objects.filter(
            school_id=school_id, homeroom_teacher_id=user.id
        ).values_list("id", flat=True)
    if is_vocal(user):
        return VocalAssignment.objects.filter(
            school_id=school_id, parent_id=user.id, active=True
        ).values_list("group_id", flat=True)
    return Group.objects.none().values_list("id", flat=True)

class FundraisingEventListCreateView(generics.ListCreateAPIView):
    serializer_class = FundraisingEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]
    throttle_classes = [EventCreateThrottle]

    def get_queryset(self):
        return FundraisingEvent.objects.filter(school_id=self.request.school_id)

    def perform_create(self, serializer):
        school_year = SchoolYear.objects.filter(
            school_id=self.request.school_id, is_current=True
        ).first()
        serializer.save(school_id=self.request.school_id, school_year=school_year)


class FundraisingEventDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = FundraisingEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirectorOrReadOnly]

    def get_queryset(self):
        return FundraisingEvent.objects.filter(school_id=self.request.school_id)


class FundraisingEventUpdateView(generics.UpdateAPIView):
    serializer_class = FundraisingEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsDirector]

    def get_queryset(self):
        return FundraisingEvent.objects.filter(school_id=self.request.school_id)


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

class FundraisingLedgerListCreateView(generics.ListCreateAPIView):
    serializer_class = FundraisingGroupLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _user_group_ids(self.request.user, self.request.school_id)
        return FundraisingGroupLedger.objects.filter(
            event__school_id=self.request.school_id, group_id__in=group_ids
        )

    def perform_create(self, serializer):
        event = serializer.validated_data.get("event")
        group = serializer.validated_data.get("group")
        user = self.request.user
        if event.school_id != self.request.school_id or group.school_id != self.request.school_id:
            raise PermissionDenied("Event or group mismatch for school")
        if event.school_id != group.school_id:
            raise PermissionDenied("Event and group must belong to the same school")
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


class FundraisingLedgerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FundraisingGroupLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _user_group_ids(self.request.user, self.request.school_id)
        return FundraisingGroupLedger.objects.filter(
            event__school_id=self.request.school_id, group_id__in=group_ids
        )

    def perform_update(self, serializer):
        ledger = self.get_object()
        if not can_record_fundraising_ledger(self.request.user, ledger.group):
            raise PermissionDenied("Not allowed to update ledger for this group")
        serializer.save()

    def perform_destroy(self, instance):
        if not can_record_fundraising_ledger(self.request.user, instance.group):
            raise PermissionDenied("Not allowed to delete ledger for this group")
        instance.delete()

class ExpenseEvidenceListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseEvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _user_group_ids(self.request.user, self.request.school_id)
        return ExpenseEvidence.objects.filter(
            Q(ledger__event__school_id=self.request.school_id)
            | Q(group__school_id=self.request.school_id)
        ).filter(Q(group_id__in=group_ids) | Q(ledger__group_id__in=group_ids))

    def perform_create(self, serializer):
        ledger = serializer.validated_data.get("ledger")
        group = serializer.validated_data.get("group") or (ledger.group if ledger else None)
        user = self.request.user
        if ledger and ledger.event.school_id != self.request.school_id:
            raise PermissionDenied("Ledger mismatch for school")
        if group and group.school_id != self.request.school_id:
            raise PermissionDenied("Group mismatch for school")
        if not can_upload_expense(user, group):
            raise PermissionDenied("Not allowed to upload expenses for this group")
        serializer.save(uploader=user)


class ExpenseEvidenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseEvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_ids = _user_group_ids(self.request.user, self.request.school_id)
        return ExpenseEvidence.objects.filter(
            Q(ledger__event__school_id=self.request.school_id)
            | Q(group__school_id=self.request.school_id)
        ).filter(Q(group_id__in=group_ids) | Q(ledger__group_id__in=group_ids))

    def _check_permission(self, expense):
        group = expense.group or expense.ledger.group
        if not can_upload_expense(self.request.user, group):
            raise PermissionDenied("Not allowed to modify expenses for this group")

    def perform_update(self, serializer):
        expense = self.get_object()
        self._check_permission(expense)
        serializer.save()

    def perform_destroy(self, instance):
        self._check_permission(instance)
        instance.delete()
