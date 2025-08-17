from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone
from django.utils.dateparse import parse_date

from core.models import (
    Complaint,
    User,
    Event,
    Homework,
    EventGroupAudience,
    ParentStudent,
)
from core.permissions import IsDirector
from fundraising.models import FundraisingGroupLedger
from surveys.models import SurveyVote
from suggestions.models import Suggestion

from .serializers import (
    OverviewAnalyticsSerializer,
    ComplaintsAnalyticsSerializer,
    FundraisingAnalyticsSerializer,
    EngagementAnalyticsSerializer,
    EventsAnalyticsSerializer,
)


class OverviewAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        if request.user.school_id != school_id:
            raise PermissionDenied("Invalid school")
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

        # Fundraising aggregated by group and event
        fundraising_qs = FundraisingGroupLedger.objects.filter(
            event__school_id=school_id
        )
        fundraising_totals = fundraising_qs.values("group__id").annotate(
            total=Sum("amount_collected")
        )
        fundraising_by_event = fundraising_qs.values("event__id").annotate(
            total=Sum("amount_collected")
        )
        fundraising_total = (
            fundraising_qs.aggregate(total=Sum("amount_collected"))
            ["total"]
            or 0
        )

        # Survey participation by group and survey
        survey_qs = SurveyVote.objects.filter(survey__school_id=school_id)
        survey_participation = (
            survey_qs.values("survey__group").annotate(votes=Count("id"))
        )
        survey_participation_by_survey = survey_qs.values("survey_id").annotate(
            votes=Count("id")
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

        serializer = OverviewAnalyticsSerializer(
            {
                "complaints_total": total_complaints,
                "complaints_open": open_complaints,
                "suggestions_total": suggestions_total,
                "complaints_by_group": list(complaints_by_group),
                "fundraising_by_group": list(fundraising_totals),
                "fundraising_by_event": list(fundraising_by_event),
                "fundraising_total": fundraising_total,
                "surveys_participation": list(survey_participation),
                "surveys_participation_by_survey": list(
                    survey_participation_by_survey
                ),
                "suggestions_by_status": list(suggestions_by_status),
                "events_total": events_total,
                "events_upcoming": events_upcoming,
                "events_cancelled": events_cancelled,
                "events_by_scope": list(events_by_scope),
            }
        )
        return Response(serializer.data)


class ComplaintsAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        if request.user.school_id != school_id:
            raise PermissionDenied("Invalid school")

        group_id = request.query_params.get("group_id")
        status = request.query_params.get("status")

        complaints_qs = Complaint.objects.filter(school_id=school_id)
        if group_id:
            complaints_qs = complaints_qs.filter(group_id=group_id)
        if status:
            complaints_qs = complaints_qs.filter(status=status)

        total_complaints = complaints_qs.count()
        open_complaints = complaints_qs.filter(
            status=Complaint.Status.OPEN
        ).count()

        complaints_by_group = (
            complaints_qs.values("group")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        top_parents = (
            complaints_qs.filter(created_by__role=User.Roles.PADRE)
            .values("created_by")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )

        least_problematic_groups = (
            complaints_qs.values("group")
            .annotate(total=Count("id"))
            .order_by("total")[:5]
        )

        events_qs = EventGroupAudience.objects.filter(event__school_id=school_id)
        if group_id:
            events_qs = events_qs.filter(group_id=group_id)
        events_by_group = (
            events_qs.values("group_id")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        serializer = ComplaintsAnalyticsSerializer(
            {
                "complaints_total": total_complaints,
                "complaints_open": open_complaints,
                "complaints_by_group": list(complaints_by_group),
                "top_parents_by_complaints": list(top_parents),
                "least_problematic_groups": list(least_problematic_groups),
                "events_by_group": list(events_by_group),
            }
        )
        return Response(serializer.data)


class FundraisingAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        if request.user.school_id != school_id:
            raise PermissionDenied("Invalid school")
        event_id = request.query_params.get("event_id")

        ledger_qs = FundraisingGroupLedger.objects.filter(event__school_id=school_id)
        if event_id:
            ledger_qs = ledger_qs.filter(event_id=event_id)

        fundraising_by_group = ledger_qs.values("group__id").annotate(
            total=Sum("amount_collected")
        )
        fundraising_by_event = ledger_qs.values("event__id").annotate(
            total=Sum("amount_collected")
        )
        fundraising_total = (
            ledger_qs.aggregate(total=Sum("amount_collected"))["total"] or 0
        )

        serializer = FundraisingAnalyticsSerializer(
            {
                "fundraising_by_group": list(fundraising_by_group),
                "fundraising_by_event": list(fundraising_by_event),
                "fundraising_total": fundraising_total,
            }
        )
        return Response(serializer.data)


class EngagementAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        if request.user.school_id != school_id:
            raise PermissionDenied("Invalid school")
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

        serializer = EngagementAnalyticsSerializer(
            {
                "surveys_participation": survey_data,
                "homework_participation": list(homework_data),
                "events_participation": list(event_data),
                "participation_rate_by_group": participation_rate,
            }
        )
        return Response(serializer.data)


class EventsAnalyticsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        school_id = request.school_id
        if request.user.school_id != school_id:
            raise PermissionDenied("Invalid school")

        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        group_id = request.query_params.get("group_id")
        scope = request.query_params.get("scope")

        events_qs = Event.objects.filter(school_id=school_id)
        if from_date:
            parsed_from = parse_date(from_date)
            if parsed_from:
                events_qs = events_qs.filter(start_at__date__gte=parsed_from)
        if to_date:
            parsed_to = parse_date(to_date)
            if parsed_to:
                events_qs = events_qs.filter(start_at__date__lte=parsed_to)
        if group_id:
            events_qs = events_qs.filter(group_audiences__group_id=group_id)
        if scope:
            events_qs = events_qs.filter(scope=scope)

        events_by_day = (
            events_qs.annotate(day=TruncDate("start_at"))
            .values("day")
            .annotate(total=Count("id"))
            .order_by("day")
        )
        events_by_day = [
            {"date": item["day"].isoformat(), "total": item["total"]}
            for item in events_by_day
        ]

        events_by_week = (
            events_qs.annotate(week=TruncWeek("start_at"))
            .values("week")
            .annotate(total=Count("id"))
            .order_by("week")
        )
        events_by_week = [
            {"week": item["week"].date().isoformat(), "total": item["total"]}
            for item in events_by_week
        ]

        events_by_month = (
            events_qs.annotate(month=TruncMonth("start_at"))
            .values("month")
            .annotate(total=Count("id"))
            .order_by("month")
        )
        events_by_month = [
            {"month": item["month"].date().isoformat(), "total": item["total"]}
            for item in events_by_month
        ]

        events_by_group = (
            events_qs.values("group_audiences__group_id")
            .annotate(total=Count("id"))
            .order_by("group_audiences__group_id")
        )
        events_by_group = [
            {"group_id": item["group_audiences__group_id"], "total": item["total"]}
            for item in events_by_group
            if item["group_audiences__group_id"] is not None
        ]

        events_by_scope = (
            events_qs.values("scope")
            .annotate(total=Count("id"))
            .order_by("scope")
        )

        serializer = EventsAnalyticsSerializer(
            {
                "events_by_day": events_by_day,
                "events_by_week": events_by_week,
                "events_by_month": events_by_month,
                "events_by_group": events_by_group,
                "events_by_scope": list(events_by_scope),
            }
        )
        return Response(serializer.data)

