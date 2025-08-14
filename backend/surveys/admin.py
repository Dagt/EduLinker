from django.contrib import admin
from .models import Survey, SurveyVote

@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ("id","school","scope","group","title","status","start_at","end_at","created_by")
    list_filter = ("school","scope","status","group")
    search_fields = ("title","description")

@admin.register(SurveyVote)
class SurveyVoteAdmin(admin.ModelAdmin):
    list_display = ("id","survey","voter","option_index","created_at")
    list_filter = ("survey",)
