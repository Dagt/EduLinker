from rest_framework import serializers
from .models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence
from core.models import Group

class FundraisingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundraisingEvent
        fields = ["id", "name", "date", "description"]

class FundraisingGroupLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundraisingGroupLedger
        fields = ["id", "event", "group", "amount_collected", "notes", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            self.fields["group"].queryset = Group.objects.filter(school_id=request.school_id)

class ExpenseEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseEvidence
        fields = ["id", "ledger", "group", "file_url", "amount", "concept", "created_at", "uploader"]
        read_only_fields = ["uploader", "created_at"]
