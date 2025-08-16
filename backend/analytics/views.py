from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from core.models import (
    Complaint,
    User,
    Event,
    Homework,
    EventGroupAudience,
    ParentStudent,
)
from fundraising.models import FundraisingGroupLedger
from surveys.models import SurveyVote
from suggestions.models import Suggestion


class IsDirector(BasePermission):
    """Allow access only to users with DIRECTOR role."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role == User.Roles.DIRECTOR
        )


class OverviewAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        # Complaints
        total_complaints = Complaint.objects.filter(school_id=school_id).count()
        suggestions_total = Suggestion.objects.filter(school_id=school_id).count()
        open_complaints = Complaint.objects.filter(
            school_id=school_id, status=Complaint.Status.OPEN
        ).count()
        complaints_by_group = (
            Complaint.objects.filter(school_id=school_id)
            .values("group")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        # Fundraising by group
        fundraising_totals = (
            FundraisingGroupLedger.objects.filter(event__school_id=school_id)
            .values("group__id")
            .annotate(total=Sum("amount_collected"))
        )

        # Survey participation by group
        survey_participation = (
            SurveyVote.objects.filter(survey__school_id=school_id)
            .values("survey__group")
            .annotate(votes=Count("id"))
        )

        suggestions_by_status = (
            Suggestion.objects.filter(school_id=school_id)
            .values("status")
            .annotate(total=Count("id"))
        )

        events_total = Event.objects.filter(school_id=school_id).count()
        events_upcoming = (
            Event.objects.filter(
                school_id=school_id,
                status=Event.Status.ACTIVE,
                start_at__gte=timezone.now(),
            ).count()
        )
        events_cancelled = Event.objects.filter(
            school_id=school_id, status=Event.Status.CANCELLED
        ).count()
        events_by_scope = (
            Event.objects.filter(school_id=school_id)
            .values("scope")
            .annotate(total=Count("id"))
        )

        return Response(
            {
                "complaints_total": total_complaints,
                "complaints_open": open_complaints,
                "suggestions_total": suggestions_total,
                "complaints_by_group": list(complaints_by_group),
                "fundraising_by_group": list(fundraising_totals),
                "surveys_participation": list(survey_participation),
                "suggestions_by_status": list(suggestions_by_status),
                "events_total": events_total,
                "events_upcoming": events_upcoming,
                "events_cancelled": events_cancelled,
                "events_by_scope": list(events_by_scope),
            }
        )


class ComplaintsAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        total_complaints = Complaint.objects.filter(school_id=school_id).count()
        open_complaints = Complaint.objects.filter(
            school_id=school_id, status=Complaint.Status.OPEN
        ).count()
        complaints_by_group = (
            Complaint.objects.filter(school_id=school_id)
            .values("group")
            .annotate(total=Count("id"))
            .order_by("-total")
        )
        top_parents = (
            Complaint.objects.filter(
                school_id=school_id, created_by__role=User.Roles.PADRE
            )
            .values("created_by")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )
        return Response(
            {
                "complaints_total": total_complaints,
                "complaints_open": open_complaints,
                "complaints_by_group": list(complaints_by_group),
                "top_parents_by_complaints": list(top_parents),
            }
        )


class FundraisingAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        fundraising_totals = (
            FundraisingGroupLedger.objects.filter(event__school_id=school_id)
            .values("group__id")
            .annotate(total=Sum("amount_collected"))
        )
        return Response({"fundraising_by_group": list(fundraising_totals)})


class EngagementAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        group_id = request.query_params.get("group_id")

        survey_qs = SurveyVote.objects.filter(survey__school_id=school_id)
        if group_id:
            survey_qs = survey_qs.filter(survey__group_id=group_id)
        survey_data = (
            survey_qs.values("survey__group_id").annotate(total=Count("id"))
        )
        survey_data = [
            {"group_id": item["survey__group_id"], "total": item["total"]}
            for item in survey_data
        ]

        participation_rate = []
        for item in survey_data:
            group = item["group_id"]
            parents = (
                ParentStudent.objects.filter(
                    school_id=school_id, student__memberships__group_id=group
                )
                .values("parent_id")
                .distinct()
                .count()
            )
            rate = item["total"] / parents if parents else 0
            participation_rate.append({"group_id": group, "rate": rate})

        homework_qs = Homework.objects.filter(school_id=school_id)
        if group_id:
            homework_qs = homework_qs.filter(group_id=group_id)
        homework_data = homework_qs.values("group_id").annotate(total=Count("id"))

        event_qs = EventGroupAudience.objects.filter(event__school_id=school_id)
        if group_id:
            event_qs = event_qs.filter(group_id=group_id)
        event_data = event_qs.values("group_id").annotate(total=Count("id"))

        return Response(
            {
                "surveys_participation": survey_data,
                "homework_participation": list(homework_data),
                "events_participation": list(event_data),
                "participation_rate_by_group": participation_rate,
            }
        )

