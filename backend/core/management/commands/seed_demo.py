import random
from datetime import timedelta, date, datetime, timezone as dt_tz

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.db import transaction

from core.models import (
    School, SchoolYear, User, Student, Group, GroupMembership,
    SpecialistAssignment, VocalAssignment,
    Complaint, ComplaintMessage,
    Event, EventGroupAudience, Homework, ActivityPhoto
)

FIRST_NAMES = ["Ana","Luis","María","Jorge","Sofía","Carlos","Lucía","Pedro","Daniela","Héctor","Irene","Valeria"]
LAST_NAMES = ["García","López","Martínez","Hernández","González","Pérez","Sánchez","Ramírez","Cruz","Flores"]

def rname():
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)

def utc(dt: datetime) -> datetime:
    if dt.tzinfo: return dt
    return dt.replace(tzinfo=dt_tz.utc)

class Command(BaseCommand):
    help = "Crea datos demo para EduLinker"

    @transaction.atomic
    def handle(self, *args, **opts):
        # Escuela + ciclo
        school, _ = School.objects.get_or_create(name="Colegio Demo", slug="colegio-demo", defaults={
            "subdomain": "demo", "active": True
        })
        today = date.today()
        sy_start = date(today.year, 8, 1)
        sy_end = date(today.year+1, 7, 15)
        sy, _ = SchoolYear.objects.get_or_create(school=school, name=f"Ciclo {today.year}-{today.year+1}", defaults={
            "start_date": sy_start, "end_date": sy_end, "is_current": True
        })

        # Usuarios
        director, _ = User.objects.get_or_create(
            email="director@demo.com", school=school,
            defaults=dict(first_name="Diana", last_name="Directora", role="DIRECTOR",
                          password=make_password("demo123"), is_staff=True, is_superuser=True)
        )
        titulares = []
        for grade, group_name in [(5,"5A"), (5,"5B"), (3,"3A"), (3,"3B")]:
            fn, ln = rname()
            u, _ = User.objects.get_or_create(
                email=f"{group_name.lower()}@demo.com", school=school,
                defaults=dict(first_name=fn, last_name=ln, role="MAESTRO_TITULAR",
                              password=make_password("demo123"))
            )
            titulares.append((group_name, grade, u))

        itinerantes = []
        for subj in ["Inglés","Computación","EF"]:
            fn, ln = rname()
            u, _ = User.objects.get_or_create(
                email=f"{subj.lower()}@demo.com", school=school,
                defaults=dict(first_name=fn, last_name=ln, role="MAESTRO_ITINERANTE",
                              password=make_password("demo123"))
            )
            itinerantes.append((subj, u))

        # Grupos
        groups = []
        for group_name, grade, titular in titulares:
            g, _ = Group.objects.get_or_create(
                school=school, school_year=sy, name=group_name, grade_level=grade, defaults={"homeroom_teacher": titular}
            )
            if g.homeroom_teacher_id != titular.id:
                g.homeroom_teacher = titular; g.save()
            groups.append(g)

        # Asignaciones itinerantes a todos los grupos
        for g in groups:
            for subj, teacher in itinerantes:
                SpecialistAssignment.objects.get_or_create(school=school, group=g, teacher=teacher, subject=subj)

        # Alumnos y Padres (User con role=PADRE)
        parents = []
        for g in groups:
            for _ in range(6):
                fn, ln = rname()
                student = Student.objects.create(
                    school=school, first_name=fn, last_name=ln, grade_level=g.grade_level, enrollment_code=f"ENR{random.randint(1000,9999)}"
                )
                GroupMembership.objects.create(school=school, group=g, student=student)
                pf, pl = rname()
                parent, _ = User.objects.get_or_create(
                    email=f"{student.enrollment_code.lower()}@familia.com", school=school,
                    defaults=dict(first_name=pf, last_name=pl, role="PADRE", password=make_password("demo123"))
                )
                # ParentStudent relación ya está en models.py; se maneja dentro de core (si tienes el modelo, crea aquí)
                from core.models import ParentStudent
                ParentStudent.objects.get_or_create(school=school, parent=parent, student=student, defaults={"relationship":"tutor"})
                parents.append(parent)

        # Asignar un Vocal por grupo
        for g in groups:
            p = random.choice(parents)
            VocalAssignment.objects.get_or_create(school=school, group=g, parent=p, defaults={"assigned_by": g.homeroom_teacher, "active": True})

        # Eventos (2 globales, 4 de grupo)
        now = datetime.now(dt_tz.utc)
        e1 = Event.objects.create(school=school, school_year=sy, scope="GLOBAL", title="Kermés Escolar",
                                  description="Recaudación general", location="Patio", start_at=utc(now+timedelta(days=7)),
                                  end_at=utc(now+timedelta(days=7, hours=3)), created_by=director, status="ACTIVE")
        e2 = Event.objects.create(school=school, school_year=sy, scope="GLOBAL", title="Festival de Invierno",
                                  description="Programa artístico", location="Auditorio", start_at=utc(now+timedelta(days=40)),
                                  end_at=utc(now+timedelta(days=40, hours=2)), created_by=director, status="ACTIVE")
        for g in groups[:4]:
            eg = Event.objects.create(school=school, school_year=sy, scope="GROUP", title=f"Junta {g.name}",
                                      description="Información a padres", location=g.name,
                                      start_at=utc(now+timedelta(days=random.randint(5,20))),
                                      end_at=utc(now+timedelta(days=random.randint(5,20), hours=1)),
                                      created_by=g.homeroom_teacher, status="ACTIVE")
            EventGroupAudience.objects.create(event=eg, group=g)

        # Tareas
        for g in groups:
            Homework.objects.create(school=school, group=g, subject="Español", teacher=g.homeroom_teacher,
                                    title=f"Lectura {g.name}", description="Cap. 1-2", due_date=utc(now+timedelta(days=3)))

        # Evidencias
        for g in groups:
            ActivityPhoto.objects.create(school=school, group=g, uploaded_by=g.homeroom_teacher,
                                         photo_url="https://via.placeholder.com/300", caption=f"Actividad {g.name}")

        # Quejas y mensajes
        c = Complaint.objects.create(
            school=school, group=groups[0], created_by=random.choice(parents),
            target_teacher=groups[0].homeroom_teacher, status="OPEN", description="Situación en el recreo",
        )
        ComplaintMessage.objects.create(complaint=c, author=groups[0].homeroom_teacher, message="Reviso el caso y doy seguimiento.")

        self.stdout.write(self.style.SUCCESS("Seed demo creada. Credenciales:"))
        self.stdout.write("Director: director@demo.com / demo123")
        self.stdout.write("Maestros titulares: 5A@demo.com, 5B@demo.com, 3A@demo.com, 3B@demo.com / demo123")
        self.stdout.write("Itinerantes: ingles@demo.com, computación@demo.com, ef@demo.com / demo123")
