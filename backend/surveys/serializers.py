from rest_framework import serializers
from .models import Survey, SurveyVote
from core.models import Group

class SurveySerializer(serializers.ModelSerializer):
    votes_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Survey
        fields = [
            "id",
            "scope",
            "group",
            "title",
            "description",
            "options",
            "is_anonymous",
            "start_at",
            "end_at",
            "status",
            "votes_count",
        ]
        read_only_fields = ["status"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            self.fields["group"].queryset = Group.objects.filter(school_id=request.school_id)

    def get_votes_count(self, obj):
        return obj.votes.count()

    def validate(self, attrs):
        scope = attrs.get("scope")
        group = attrs.get("group")
        if scope == Survey.Scope.GROUP and not group:
            raise serializers.ValidationError("group is required for group scope")
        if scope == Survey.Scope.SCHOOL and group:
            raise serializers.ValidationError("group not allowed for school scope")
        return attrs

class SurveyVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyVote
        fields = ["id", "option_index"]
