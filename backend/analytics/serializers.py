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


class ComplaintsAnalyticsSerializer(serializers.Serializer):
    """Serializer for the complaints analytics endpoint."""

    complaints_total = serializers.IntegerField()
    complaints_open = serializers.IntegerField()
    complaints_by_group = serializers.ListField(child=serializers.JSONField())
    top_parents_by_complaints = serializers.ListField(
        child=serializers.JSONField()
    )
    least_problematic_groups = serializers.ListField(child=serializers.JSONField())
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

