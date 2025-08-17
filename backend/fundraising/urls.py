from django.urls import path
from .views import (
    FundraisingEventListCreateView,
    FundraisingEventDetailView,
    FundraisingEventUpdateView,
    FundraisingLedgerListCreateView,
    FundraisingLedgerDetailView,
    ExpenseEvidenceListCreateView,
    ExpenseEvidenceDetailView,
    FundraisingEventSummaryView,
    FundraisingEventExportView,
)

urlpatterns = [
    path("fundraising-events/", FundraisingEventListCreateView.as_view(), name="fundraising-event-list-create"),
    path("fundraising-events/<int:pk>/", FundraisingEventDetailView.as_view(), name="fundraising-event-detail"),
    path("fundraising-events/<int:pk>/update/", FundraisingEventUpdateView.as_view(), name="fundraising-event-update"),
    path("fundraising-events/<int:pk>/summary/", FundraisingEventSummaryView.as_view(), name="fundraising-event-summary"),
    path("fundraising-events/<int:pk>/export/", FundraisingEventExportView.as_view(), name="fundraising-event-export"),
    path("fundraising-ledger/", FundraisingLedgerListCreateView.as_view(), name="fundraising-ledger-list-create"),
    path("fundraising-ledger/<int:pk>/", FundraisingLedgerDetailView.as_view(), name="fundraising-ledger-detail"),
    path("expense-evidences/", ExpenseEvidenceListCreateView.as_view(), name="expense-evidence-list-create"),
    path("expense-evidences/<int:pk>/", ExpenseEvidenceDetailView.as_view(), name="expense-evidence-detail"),
]
