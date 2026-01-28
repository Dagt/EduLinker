"""Serializers used to shape responses from analytics views."""

from rest_framework import serializers


class OverviewAnalyticsSerializer(serializers.Serializer):
    """Serializer for the overview analytics endpoint."""

    complaints_total = serializers.IntegerField()
    complaints_open = serializers.IntegerField()
    suggestions_total = serializers.IntegerField()
    complaints_by_group = serializers.ListField(child=serializers.JSONField())
    fundraising_by_group = serializers.ListField(child=serializers.JSONField())
    fundraising_by_event = serializers.ListField(child=serializers.JSONField())
    fundraising_total = serializers.FloatField()
    surveys_participation = serializers.ListField(child=serializers.JSONField())
    surveys_participation_by_survey = serializers.ListField(
        child=serializers.JSONField()
    )
    suggestions_by_status = serializers.ListField(child=serializers.JSONField())
    events_total = serializers.IntegerField()
    events_upcoming = serializers.IntegerField()
    events_cancelled = serializers.IntegerField()
    events_by_scope = serializers.ListField(child=serializers.JSONField())
    rsvp_by_group = serializers.ListField(child=serializers.JSONField())
    rsvp_attendance_rate_by_group = serializers.ListField(
        child=serializers.JSONField()
    )


class ParentComplaintsSerializer(serializers.Serializer):
    """Serializer for parent complaint totals."""

    created_by = serializers.IntegerField()
    total = serializers.IntegerField()


class GroupParticipationSerializer(serializers.Serializer):
    """Serializer for group participation and complaints."""

    group = serializers.IntegerField()
    complaints = serializers.IntegerField()
    participation = serializers.IntegerField()


class ComplaintsAnalyticsSerializer(serializers.Serializer):
    """Serializer for the complaints analytics endpoint."""

    complaints_total = serializers.IntegerField()
    complaints_open = serializers.IntegerField()
    complaints_by_group = serializers.ListField(child=serializers.JSONField())
    top_parents_by_complaints = ParentComplaintsSerializer(many=True)
    least_problematic_groups = GroupParticipationSerializer(many=True)
    events_by_group = serializers.ListField(child=serializers.JSONField())


class FundraisingAnalyticsSerializer(serializers.Serializer):
    """Serializer for the fundraising analytics endpoint."""

    fundraising_by_group = serializers.ListField(child=serializers.JSONField())
    fundraising_by_event = serializers.ListField(child=serializers.JSONField())
    fundraising_total = serializers.FloatField()


class EngagementAnalyticsSerializer(serializers.Serializer):
    """Serializer for the engagement analytics endpoint."""

    surveys_participation = serializers.ListField(child=serializers.JSONField())
    homework_participation = serializers.ListField(child=serializers.JSONField())
    events_participation = serializers.ListField(child=serializers.JSONField())
    participation_rate_by_group = serializers.ListField(
        child=serializers.JSONField()
    )
    rsvp_by_group = serializers.ListField(child=serializers.JSONField())
    rsvp_attendance_rate_by_group = serializers.ListField(
        child=serializers.JSONField()
    )


class EventsAnalyticsSerializer(serializers.Serializer):
    """Serializer for the events analytics endpoint."""

    events_by_day = serializers.ListField(child=serializers.JSONField())
    events_by_week = serializers.ListField(child=serializers.JSONField())
    events_by_month = serializers.ListField(child=serializers.JSONField())
    events_by_group = serializers.ListField(child=serializers.JSONField())
    events_by_scope = serializers.ListField(child=serializers.JSONField())


class AttendanceAnalyticsSerializer(serializers.Serializer):
    """Serializer for event attendance analytics."""

    attending_yes = serializers.IntegerField()
    attending_no = serializers.IntegerField()
    attending_maybe = serializers.IntegerField()
    participation_rate = serializers.FloatField()
    attendance_by_group = serializers.ListField(child=serializers.JSONField())
