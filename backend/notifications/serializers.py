from rest_framework import serializers
from .models import DeviceToken

class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ["id", "token", "platform", "active", "created_at", "updated_at"]
        read_only_fields = ["id", "active", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context["request"]
        school_id = request.school_id
        user = request.user
        token = validated_data["token"]
        obj, _ = DeviceToken.objects.update_or_create(
            token=token,
            defaults={
                "school_id": school_id,
                "user": user,
                "platform": validated_data.get("platform", "android"),
                "active": True,
            },
        )
        return obj
