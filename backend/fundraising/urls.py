from django.urls import path
from .views import (
    FundraisingEventListCreateView,
    FundraisingEventDetailView,
    FundraisingEventUpdateView,
    FundraisingLedgerCreateView,
    ExpenseEvidenceCreateView,
    FundraisingEventSummaryView,
)

urlpatterns = [
    path("fundraising-events/", FundraisingEventListCreateView.as_view(), name="fundraising-event-list-create"),
    path("fundraising-events/<int:pk>/", FundraisingEventDetailView.as_view(), name="fundraising-event-detail"),
    path("fundraising-events/<int:pk>/update/", FundraisingEventUpdateView.as_view(), name="fundraising-event-update"),
    path("fundraising-events/<int:pk>/summary/", FundraisingEventSummaryView.as_view(), name="fundraising-event-summary"),
    path("fundraising-ledger/", FundraisingLedgerCreateView.as_view(), name="fundraising-ledger-create"),
    path("expense-evidences/", ExpenseEvidenceCreateView.as_view(), name="expense-evidence-create"),
]
