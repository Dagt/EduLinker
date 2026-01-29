from rest_framework import serializers
from .models import AuditLog
from core.serializers import UserSerializer

class AuditLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'school', 'actor', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']
