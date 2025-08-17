from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Survey, SurveyVote
from .serializers import SurveySerializer, SurveyVoteSerializer
from core.throttles import SurveyThrottle
from core.permissions import (
    is_director,
    is_maestro_titular,
    is_maestro_itinerante,
    is_vocal,
    is_padre,
)
from core.models import GroupMembership, ParentStudent, SpecialistAssignment, VocalAssignment

class SurveyListCreateView(generics.ListCreateAPIView):
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SurveyThrottle]

    def get_queryset(self):
        qs = Survey.objects.filter(school_id=self.request.school_id)
        params = self.request.query_params
        if "status" in params:
            qs = qs.filter(status=params["status"])
        if "group_id" in params:
            qs = qs.filter(group_id=params["group_id"])
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        scope = serializer.validated_data.get("scope")
        group = serializer.validated_data.get("group")
        # director puede crear cualquier encuesta
        if scope == Survey.Scope.SCHOOL and not is_director(user):
            raise PermissionDenied("Only directors can create school surveys")
        if scope == Survey.Scope.GROUP:
            # grupo: director, maestro titular del grupo o vocal activo
            if not (
                is_director(user)
                or (is_maestro_titular(user) and group.homeroom_teacher_id == user.id)
                or (is_vocal(user) and VocalAssignment.objects.filter(group=group, parent=user, active=True).exists())
            ):
                raise PermissionDenied("Not allowed to create group survey")
        serializer.save(
            school_id=self.request.school_id,
            created_by=user,
            status=Survey.Status.ACTIVE,
        )

class SurveyDetailView(generics.RetrieveAPIView):
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Survey.objects.filter(school_id=self.request.school_id)

class SurveyVoteView(generics.CreateAPIView):
    serializer_class = SurveyVoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SurveyThrottle]

    def perform_create(self, serializer):
        survey = get_object_or_404(
            Survey, pk=self.kwargs["pk"], school_id=self.request.school_id
        )
        if not survey.is_active():
            raise PermissionDenied("Survey is not active")
        user = self.request.user
        # Validar elegibilidad de voto en encuestas de grupo
        if survey.scope == Survey.Scope.GROUP:
            group = survey.group
            if not (
                is_director(user)
                or (is_maestro_titular(user) and group.homeroom_teacher_id == user.id)
                or (is_maestro_itinerante(user) and SpecialistAssignment.objects.filter(group=group, teacher=user).exists())
                or (is_vocal(user) and VocalAssignment.objects.filter(group=group, parent=user, active=True).exists())
                or (
                    is_padre(user)
                    and GroupMembership.objects.filter(
                        group=group,
                        student__in=ParentStudent.objects.filter(parent=user).values_list("student_id", flat=True),
                    ).exists()
                )
            ):
                raise PermissionDenied("Not allowed to vote in this survey")
        serializer.save(survey=survey, voter=user)


class SurveyResultsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        survey = get_object_or_404(
            Survey, pk=pk, school_id=self.request.school_id
        )
        user = request.user
        # Check permissions
        allowed = False
        if survey.created_by_id == user.id or is_director(user):
            allowed = True
        elif survey.scope == Survey.Scope.GROUP:
            group = survey.group
            if (
                is_maestro_titular(user)
                and group.homeroom_teacher_id == user.id
            ) or (
                is_maestro_itinerante(user)
                and SpecialistAssignment.objects.filter(group=group, teacher=user).exists()
            ) or (
                is_vocal(user)
                and VocalAssignment.objects.filter(group=group, parent=user, active=True).exists()
            ):
                allowed = True
        if not allowed:
            raise PermissionDenied("Not allowed to view results")

        agg = (
            SurveyVote.objects.filter(survey=survey)
            .values("option_index")
            .annotate(count=Count("id"))
            .order_by("option_index")
        )
        results = {str(item["option_index"]): item["count"] for item in agg}
        data = {"results": results}
        if not survey.is_anonymous:
            votes = (
                SurveyVote.objects.filter(survey=survey)
                .select_related("voter")
                .order_by("id")
            )
            data["votes"] = [
                {
                    "id": v.voter_id,
                    "name": v.voter.get_full_name(),
                    "option_index": v.option_index,
                }
                for v in votes
            ]
        return Response(data)
