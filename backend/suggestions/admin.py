from django.contrib import admin
from .models import Suggestion, SuggestionMessage

@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ("id","school","group","created_by","target_teacher","status","title","created_at")
    list_filter = ("school","group","status")
    search_fields = ("title","description")

@admin.register(SuggestionMessage)
class SuggestionMessageAdmin(admin.ModelAdmin):
    list_display = ("id","suggestion","author","created_at")
