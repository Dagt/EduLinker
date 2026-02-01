from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Complaint, Event, Student, User


class UserFilter(filters.FilterSet):
    name = filters.CharFilter(method="filter_name")
    email = filters.CharFilter(field_name="email", lookup_expr="icontains")
    status = filters.CharFilter(method="filter_status")
    role = filters.CharFilter(field_name="role", lookup_expr="iexact")

    class Meta:
        model = User
        fields = ["name", "email", "status", "role"]

    def filter_name(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value) | Q(last_name__icontains=value)
        )

    def filter_status(self, queryset, name, value):
        normalized = value.strip().lower()
        if normalized in {"active", "true", "1", "yes"}:
            return queryset.filter(is_active=True)
        if normalized in {"inactive", "false", "0", "no"}:
            return queryset.filter(is_active=False)
        return queryset


class StudentFilter(filters.FilterSet):
    name = filters.CharFilter(method="filter_name")
    grade_level = filters.NumberFilter(field_name="grade_level")

    class Meta:
        model = Student
        fields = ["name", "grade_level"]

    def filter_name(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value) | Q(last_name__icontains=value)
        )


class ComplaintFilter(filters.FilterSet):
    name = filters.CharFilter(method="filter_name")
    email = filters.CharFilter(field_name="created_by__email", lookup_expr="icontains")
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    group_id = filters.NumberFilter(field_name="group_id")

    class Meta:
        model = Complaint
        fields = ["name", "email", "status", "group_id"]

    def filter_name(self, queryset, name, value):
        return queryset.filter(
            Q(created_by__first_name__icontains=value)
            | Q(created_by__last_name__icontains=value)
        )


class EventFilter(filters.FilterSet):
    name = filters.CharFilter(method="filter_name")
    email = filters.CharFilter(field_name="created_by__email", lookup_expr="icontains")
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = Event
        fields = ["name", "email", "status"]

    def filter_name(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value)
            | Q(created_by__first_name__icontains=value)
            | Q(created_by__last_name__icontains=value)
        )
