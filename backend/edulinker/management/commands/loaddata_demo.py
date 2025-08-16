"""Management command to load demo data for EduLinker.

Creates a sample school with users, a group and an event so that the
platform can be explored quickly. The dataset mirrors the examples
described in ``docs/seeds.md``.
"""

from datetime import date
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from core.models import (
    School,
    SchoolYear,
    User,
    Group,
    Event,
    EventGroupAudience,
)


class Command(BaseCommand):
    help = "Crea datos demo para explorar la plataforma"

    def handle(self, *args, **options):
        school, _ = School.objects.get_or_create(
            name="Colegio Demo",
            slug="colegio-demo",
            defaults={"subdomain": "demo", "active": True},
        )
        today = date.today()
        sy, _ = SchoolYear.objects.get_or_create(
            school=school,
            name=f"Ciclo {today.year}-{today.year + 1}",
            defaults={
                "start_date": today,
                "end_date": today,
                "is_current": True,
            },
        )
        director, _ = User.objects.get_or_create(
            username="director@demo.com",
            email="director@demo.com",
            school=school,
            defaults={
                "first_name": "Diana",
                "last_name": "Directora",
                "role": "DIRECTOR",
                "password": make_password("demo123"),
                "is_staff": True,
                "is_superuser": True,
            },
        )
        teacher, _ = User.objects.get_or_create(
            username="profesor@demo.com",
            email="profesor@demo.com",
            school=school,
            defaults={
                "first_name": "Pedro",
                "last_name": "Profesor",
                "role": "MAESTRO_TITULAR",
                "password": make_password("demo123"),
            },
        )
        group, _ = Group.objects.get_or_create(
            school=school,
            school_year=sy,
            name="5A",
            grade_level=5,
            defaults={"homeroom_teacher": teacher},
        )
        event, _ = Event.objects.get_or_create(
            school=school,
            school_year=sy,
            scope="GROUP",
            title="Bienvenida",
            defaults={
                "description": "Evento de bienvenida",
                "location": "Aula 5A",
                "start_at": timezone.now(),
                "end_at": timezone.now(),
                "created_by": teacher,
                "status": "ACTIVE",
            },
        )
        EventGroupAudience.objects.get_or_create(event=event, group=group)
        self.stdout.write(self.style.SUCCESS("Datos demo cargados"))
