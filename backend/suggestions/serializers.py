from rest_framework import serializers
from .models import Suggestion, SuggestionMessage
from core.models import Group

class SuggestionMessageSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = SuggestionMessage
        fields = ["id", "author", "message", "attachments", "created_at"]

class SuggestionSerializer(serializers.ModelSerializer):
    messages = SuggestionMessageSerializer(many=True, read_only=True)
    class Meta:
        model = Suggestion
        fields = [
            "id", "group", "created_by", "target_teacher",
            "title", "description", "status", "created_at", "updated_at", "messages",
        ]
        read_only_fields = ["created_by", "status"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            self.fields["group"].queryset = Group.objects.filter(school_id=request.school_id)

    def validate(self, attrs):
        group = attrs.get("group")
        target_teacher = attrs.get("target_teacher")
        school_id = self.context["request"].school_id
        if group and group.school_id != school_id:
            raise serializers.ValidationError("Group mismatch for school")
        if target_teacher and target_teacher.school_id != school_id:
            raise serializers.ValidationError("Teacher mismatch for school")
        return attrs


class SuggestionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suggestion
        fields = ["status"]
