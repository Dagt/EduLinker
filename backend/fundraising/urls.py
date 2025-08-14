from django.urls import path
from .views import FundraisingEventListCreateView, FundraisingLedgerCreateView, ExpenseEvidenceCreateView

urlpatterns = [
    path("fundraising-events/", FundraisingEventListCreateView.as_view(), name="fundraising-event-list-create"),
    path("fundraising-ledger/", FundraisingLedgerCreateView.as_view(), name="fundraising-ledger-create"),
    path("expense-evidences/", ExpenseEvidenceCreateView.as_view(), name="expense-evidence-create"),
]
