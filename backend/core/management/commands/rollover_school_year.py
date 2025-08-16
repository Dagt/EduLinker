from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import (
    SchoolYear,
    Group,
    VocalAssignment,
    ParentStudent,
    GroupMembership,
)


class Command(BaseCommand):
    """Rollover school year data to a new year."""

    help = (
        "Copiar grupos, maestros titulares, vocales y relaciones padre-alumno "
        "a un nuevo SchoolYear"
    )

    def add_arguments(self, parser):
        parser.add_argument("from_year", type=int, help="ID del SchoolYear origen")
        parser.add_argument("to_year", type=int, help="ID del SchoolYear destino")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simular sin guardar cambios",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Confirmar que se realizará la acción",
        )

    def handle(self, *args, **opts):
        if not opts["confirm"]:
            self.stdout.write(self.style.WARNING("No se realizaron cambios. Use --confirm"))
            return

        from_year = SchoolYear.objects.get(pk=opts["from_year"])
        to_year = SchoolYear.objects.get(pk=opts["to_year"])

        if from_year.school_id != to_year.school_id:
            raise CommandError("Los ciclos escolares deben pertenecer a la misma escuela")

        old_groups = list(Group.objects.filter(school_year=from_year))
        existing_names = set(
            Group.objects.filter(school_year=to_year).values_list("name", flat=True)
        )
        duplicates = [g.name for g in old_groups if g.name in existing_names]
        if duplicates:
            raise CommandError(
                "Grupos ya existen en el ciclo destino: " + ", ".join(duplicates)
            )

        created = []

        @transaction.atomic
        def _copy():
            for g in old_groups:
                new_g = Group.objects.create(
                    school=g.school,
                    school_year=to_year,
                    name=g.name,
                    grade_level=g.grade_level,
                    homeroom_teacher=g.homeroom_teacher,
                )
                created.append(new_g)
                for va in g.vocal_assignments.filter(active=True):
                    VocalAssignment.objects.create(
                        school=va.school,
                        group=new_g,
                        parent=va.parent,
                        assigned_by=va.assigned_by,
                        start_at=va.start_at,
                        end_at=va.end_at,
                        active=va.active,
                    )

                # Ensure parent-student relations exist
                ps_qs = ParentStudent.objects.filter(
                    student__memberships__group=g
                ).distinct()
                for ps in ps_qs:
                    ParentStudent.objects.get_or_create(
                        school=ps.school,
                        parent=ps.parent,
                        student=ps.student,
                        defaults={"relationship": ps.relationship},
                    )

                # Copy group memberships
                for gm in g.memberships.all():
                    GroupMembership.objects.get_or_create(
                        school=gm.school,
                        group=new_g,
                        student=gm.student,
                    )

            if opts["dry_run"]:
                self.stdout.write(self.style.WARNING("Dry-run: descartando cambios"))
                transaction.set_rollback(True)

        _copy()
        self.stdout.write(self.style.SUCCESS(f"Se copiaron {len(created)} grupos"))
