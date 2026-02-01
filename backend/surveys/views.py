from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Survey, SurveyVote
from .serializers import SurveySerializer, SurveyVoteSerializer
from core.throttles import SurveyThrottle
from core.pagination import DefaultPagination
from audit.models import AuditLog
from core.permissions import (
    is_admin_tenant,
    is_director,
    is_maestro_titular,
    is_maestro_itinerante,
    is_vocal,
    is_padre,
)
from core.models import (
    Group,
    GroupMembership,
    ParentStudent,
    SpecialistAssignment,
    VocalAssignment,
)

class SurveyListCreateView(generics.ListCreateAPIView):
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SurveyThrottle]
    pagination_class = DefaultPagination

    def get_queryset(self):
        school_id = self.request.school_id
        user = self.request.user
        qs = Survey.objects.filter(school_id=school_id)
        if not (is_director(user) or is_admin_tenant(user)):
            if is_maestro_titular(user):
                group_ids = Group.objects.filter(
                    school_id=school_id, homeroom_teacher_id=user.id
                ).values_list("id", flat=True)
            elif is_maestro_itinerante(user):
                group_ids = SpecialistAssignment.objects.filter(
                    teacher_id=user.id
                ).values_list("group_id", flat=True)
            elif is_vocal(user):
                group_ids = VocalAssignment.objects.filter(
                    parent_id=user.id, active=True
                ).values_list("group_id", flat=True)
            elif is_padre(user):
                student_ids = ParentStudent.objects.filter(
                    parent_id=user.id
                ).values_list("student_id", flat=True)
                group_ids = GroupMembership.objects.filter(
                    student_id__in=student_ids
                ).values_list("group_id", flat=True)
            else:
                group_ids = Group.objects.none().values_list("id", flat=True)

            qs = qs.filter(
                Q(scope=Survey.Scope.SCHOOL) | Q(group_id__in=group_ids)
            )
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
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="create",
            entity_type="survey",
            entity_id=serializer.instance.id,
            metadata={"scope": serializer.instance.scope, "group_id": serializer.instance.group_id},
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
        vote = serializer.save(survey=survey, voter=user)
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="vote",
            entity_type="survey",
            entity_id=survey.id,
            metadata={"vote_id": vote.id, "option_index": vote.option_index},
        )


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
        AuditLog.objects.create(
            school_id=self.request.school_id,
            actor=user,
            action="read_results",
            entity_type="survey",
            entity_id=survey.id,
        )

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
