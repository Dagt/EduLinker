from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from django.db.models import Count, Sum
from core.models import Complaint, User
from fundraising.models import FundraisingGroupLedger
from surveys.models import SurveyVote
from suggestions.models import Suggestion


class IsDirector(BasePermission):
    """Allow access only to users with DIRECTOR role."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role == User.Roles.DIRECTOR
        )

@api_view(["GET"])
@permission_classes([IsDirector])
def analytics_overview(request):
    school_id = request.school_id
    # Quejas
    total_complaints = Complaint.objects.filter(school_id=school_id).count()
    suggestions_total = Suggestion.objects.filter(school_id=school_id).count()
    open_complaints = Complaint.objects.filter(school_id=school_id, status=Complaint.Status.OPEN).count()
    complaints_by_group = (
        Complaint.objects.filter(school_id=school_id)
        .values("group")
        .annotate(total=Count("id"))
        .order_by("-total")
    )
    # Recaudación por grupo
    fundraising_totals = (
        FundraisingGroupLedger.objects.filter(event__school_id=school_id)
        .values("group__id")
        .annotate(total=Sum("amount_collected"))
    )
    # Participación en encuestas por grupo (no distingue si es anónima)
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

    return Response({
        "complaints_total": total_complaints,
        "complaints_open": open_complaints,
        "suggestions_total": suggestions_total,
        "complaints_by_group": list(complaints_by_group),
        "fundraising_by_group": list(fundraising_totals),
        "surveys_participation": list(survey_participation),
        "suggestions_by_status": list(suggestions_by_status)
    })


@api_view(["GET"])
@permission_classes([IsDirector])
def analytics_complaints(request):
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
    return Response(
        {
            "complaints_total": total_complaints,
            "complaints_open": open_complaints,
            "complaints_by_group": list(complaints_by_group),
        }
    )


@api_view(["GET"])
@permission_classes([IsDirector])
def analytics_fundraising(request):
    school_id = request.school_id
    fundraising_totals = (
        FundraisingGroupLedger.objects.filter(event__school_id=school_id)
        .values("group__id")
        .annotate(total=Sum("amount_collected"))
    )
    return Response({"fundraising_by_group": list(fundraising_totals)})


@api_view(["GET"])
@permission_classes([IsDirector])
def analytics_engagement(request):
    school_id = request.school_id
    suggestions_total = Suggestion.objects.filter(school_id=school_id).count()
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
    return Response(
        {
            "suggestions_total": suggestions_total,
            "surveys_participation": list(survey_participation),
            "suggestions_by_status": list(suggestions_by_status),
        }
    )

