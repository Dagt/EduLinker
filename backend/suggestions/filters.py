from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Suggestion


class SuggestionFilter(filters.FilterSet):
    name = filters.CharFilter(method="filter_name")
    email = filters.CharFilter(field_name="created_by__email", lookup_expr="icontains")
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = Suggestion
        fields = ["name", "email", "status"]

    def filter_name(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value)
            | Q(created_by__first_name__icontains=value)
            | Q(created_by__last_name__icontains=value)
        )
