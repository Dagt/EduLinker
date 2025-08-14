from django.db import models
from core.models import School, SchoolYear, Group, User

class FundraisingEvent(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="fundraising_events")
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE, related_name="fundraising_events")
    name = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class FundraisingGroupLedger(models.Model):
    event = models.ForeignKey(FundraisingEvent, on_delete=models.CASCADE, related_name="ledgers")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="fundraising_ledgers")
    amount_collected = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fundraising_ledgers")
    created_at = models.DateTimeField(auto_now_add=True)

class ExpenseEvidence(models.Model):
    ledger = models.ForeignKey(FundraisingGroupLedger, null=True, blank=True, on_delete=models.CASCADE, related_name="expenses")
    group = models.ForeignKey(Group, null=True, blank=True, on_delete=models.CASCADE, related_name="expenses")
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expense_evidences")
    file_url = models.URLField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    concept = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
