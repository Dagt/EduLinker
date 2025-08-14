from django.contrib import admin
from .models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence

@admin.register(FundraisingEvent)
class FundraisingEventAdmin(admin.ModelAdmin):
    list_display = ("id","school","school_year","name","date")
    list_filter = ("school","school_year","date")
    search_fields = ("name","description")

@admin.register(FundraisingGroupLedger)
class FundraisingGroupLedgerAdmin(admin.ModelAdmin):
    list_display = ("id","event","group","amount_collected","created_by","created_at")
    list_filter = ("event","group")

@admin.register(ExpenseEvidence)
class ExpenseEvidenceAdmin(admin.ModelAdmin):
    list_display = ("id","ledger","group","uploader","amount","concept","created_at")
    list_filter = ("group",)
