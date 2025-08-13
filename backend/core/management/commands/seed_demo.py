from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import (
    School, SchoolYear, User, Group, Student, ParentStudent,
    GroupMembership, VocalAssignment, Complaint, Event, EventGroupAudience
)


class Command(BaseCommand):
    help = "Load demo data for EduLinker"

    def handle(self, *args, **options):
        if School.objects.exists():
            self.stdout.write(self.style.WARNING("Demo data already loaded."))
            return

        school = School.objects.create(
            name="Demo School",
            slug="demo-school",
            logo_url="",
            subdomain="demo",
        )

        year = SchoolYear.objects.create(
            school=school,
            name="2024-2025",
            start_date=timezone.now().date(),
            end_date=(timezone.now() + timezone.timedelta(days=200)).date(),
            is_current=True,
        )

        director = User.objects.create_user(
            username="director",
            password="password",
            email="director@example.com",
            role=User.Roles.DIRECTOR,
            school=school,
        )

        teacher_a = User.objects.create_user(
            username="maestroa",
            password="password",
            email="maestroa@example.com",
            role=User.Roles.MAESTRO_TITULAR,
            school=school,
        )
        teacher_b = User.objects.create_user(
            username="maestrob",
            password="password",
            email="maestrob@example.com",
            role=User.Roles.MAESTRO_TITULAR,
            school=school,
        )
        itinerant = User.objects.create_user(
            username="itinerante",
            password="password",
            email="itinerante@example.com",
            role=User.Roles.MAESTRO_ITINERANTE,
            school=school,
        )

        group_a = Group.objects.create(
            school=school,
            school_year=year,
            name="5A",
            grade_level=5,
            homeroom_teacher=teacher_a,
        )
        group_b = Group.objects.create(
            school=school,
            school_year=year,
            name="5B",
            grade_level=5,
            homeroom_teacher=teacher_b,
        )

        students = []
        for i in range(6):
            student = Student.objects.create(
                school=school,
                first_name=f"Alumno{i+1}",
                last_name="Demo",
                grade_level=5,
                enrollment_code=f"S{i+1:03d}",
            )
            parent = User.objects.create_user(
                username=f"padre{i+1}",
                password="password",
                email=f"padre{i+1}@example.com",
                role=User.Roles.PADRE,
                school=school,
            )
            ParentStudent.objects.create(
                school=school,
                parent=parent,
                student=student,
                relationship="parent",
            )
            target_group = group_a if i < 3 else group_b
            GroupMembership.objects.create(
                school=school,
                group=target_group,
                student=student,
            )
            students.append((student, parent, target_group))

        vocal_a_parent = students[0][1]
        vocal_b_parent = students[3][1]
        VocalAssignment.objects.create(
            school=school,
            group=group_a,
            parent=vocal_a_parent,
            assigned_by=teacher_a,
            active=True,
        )
        VocalAssignment.objects.create(
            school=school,
            group=group_b,
            parent=vocal_b_parent,
            assigned_by=teacher_b,
            active=True,
        )

        # Complaints
        Complaint.objects.create(
            school=school,
            group=group_a,
            created_by=vocal_a_parent,
            target_teacher=teacher_a,
            description="Primera queja",
        )
        Complaint.objects.create(
            school=school,
            group=group_b,
            created_by=vocal_b_parent,
            target_teacher=teacher_b,
            description="Segunda queja",
        )

        # Events
        global_event = Event.objects.create(
            school=school,
            school_year=year,
            scope=Event.Scope.GLOBAL,
            title="Bienvenida",
            description="Evento global",
            start_at=timezone.now(),
            end_at=timezone.now() + timezone.timedelta(hours=2),
            created_by=director,
        )
        group_event = Event.objects.create(
            school=school,
            school_year=year,
            scope=Event.Scope.GROUP,
            title="Reunión 5A",
            description="Evento de grupo",
            start_at=timezone.now(),
            end_at=timezone.now() + timezone.timedelta(hours=1),
            created_by=teacher_a,
        )
        EventGroupAudience.objects.create(event=group_event, group=group_a)

        self.stdout.write(self.style.SUCCESS("Demo data created."))
