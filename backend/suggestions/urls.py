from django.urls import path

from .views import (
    SuggestionListCreateView,
    SuggestionMessageCreateView,
    SuggestionRetrieveUpdateView,
)

urlpatterns = [
    path(
        "suggestions/",
        SuggestionListCreateView.as_view(),
        name="suggestion-list-create",
    ),
    path(
        "suggestions/<int:pk>/",
        SuggestionRetrieveUpdateView.as_view(),
        name="suggestion-detail",
    ),
    path(
        "suggestions/<int:pk>/messages/",
        SuggestionMessageCreateView.as_view(),
        name="suggestion-add-message",
    ),
]

