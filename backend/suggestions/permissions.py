from rest_framework.permissions import BasePermission
from .models import Suggestion
from core.permissions import is_director, is_maestro_titular, is_vocal, is_padre

class CanAccessSuggestion(BasePermission):
    """Autoriza a director, creador o maestro objetivo a ver la sugerencia."""

    def has_object_permission(self, request, view, obj: Suggestion):
        user = request.user
        if user.school_id != obj.school_id:
            return False
        if is_director(user) or user == obj.created_by or user == obj.target_teacher:
            return True
        # Maestro titular del grupo puede ver sugerencias de su grupo
        if obj.group and is_maestro_titular(user) and obj.group.homeroom_teacher_id == user.id:
            return True
        return False
