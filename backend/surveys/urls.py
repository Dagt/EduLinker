from django.urls import path
from .views import (
    SurveyListCreateView,
    SurveyDetailView,
    SurveyVoteView,
    SurveyResultsView,
)

urlpatterns = [
    path("surveys/", SurveyListCreateView.as_view(), name="survey-list-create"),
    path("surveys/<int:pk>/", SurveyDetailView.as_view(), name="survey-detail"),
    path("surveys/<int:pk>/vote/", SurveyVoteView.as_view(), name="survey-vote"),
    path("surveys/<int:pk>/results/", SurveyResultsView.as_view(), name="survey-results"),
]
