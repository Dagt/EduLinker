import random
from datetime import timedelta, date, datetime, timezone as dt_tz
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction, connection

from core.models import (
    School, SchoolYear, User, Student, Group, GroupMembership,
    SpecialistAssignment, VocalAssignment,
    Complaint, ComplaintMessage,
    Event, EventGroupAudience, EventPhoto, Homework, ActivityPhoto,
    Announcement,
)
from core.roles import Roles
from chat.models import GroupChat, ChatMessage
from suggestions.models import Suggestion, SuggestionMessage
from fundraising.models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence
from notifications.models import NotificationPreference
from surveys.models import Survey

FIRST_NAMES = ["Ana","Luis","María","Jorge","Sofía","Carlos","Lucía","Pedro","Daniela","Héctor","Irene","Valeria"]
LAST_NAMES = ["García","López","Martínez","Hernández","González","Pérez","Sánchez","Ramírez","Cruz","Flores"]

def rname():
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)

def utc(dt: datetime) -> datetime:
    if dt.tzinfo: return dt
    return dt.replace(tzinfo=dt_tz.utc)

def safe_username(value: str | None, fallback: str) -> str:
    if value is None:
        return fallback
    cleaned = value.strip()
    return cleaned if cleaned else fallback

class Command(BaseCommand):
    help = "Crea datos demo para EduLinker"

    @transaction.atomic
    def handle(self, *args, **opts):
        # Escuela + ciclo
        school, _ = School.objects.get_or_create(name="Colegio Demo", slug="colegio-demo", defaults={
            "subdomain": "demo", "active": True
        })
        # Ensure tenant schema has all tables before inserting tenant data.
        call_command(
            "migrate_schemas",
            schema_name=school.schema_name,
            tenant=True,
            interactive=False,
            verbosity=0,
        )
        connection.set_tenant(school)
        today = date.today()
        sy_start = date(today.year, 8, 1)
        sy_end = date(today.year+1, 7, 15)
        sy, _ = SchoolYear.objects.get_or_create(school=school, name=f"Ciclo {today.year}-{today.year+1}", defaults={
            "start_date": sy_start, "end_date": sy_end, "is_current": True
        })
        prev_sy_start = date(today.year - 1, 8, 1)
        prev_sy_end = date(today.year, 7, 15)
        SchoolYear.objects.get_or_create(
            school=school,
            name=f"Ciclo {today.year-1}-{today.year}",
            defaults={"start_date": prev_sy_start, "end_date": prev_sy_end, "is_current": False},
        )

        # Usuarios
        director_username = safe_username("director_demo", "director_demo")
        director, _ = User.objects.update_or_create(
            email="director@demo.com",
            school=school,
            defaults=dict(
                username=director_username,
                first_name="Diana",
                last_name="Directora",
                role=Roles.DIRECTOR,
                is_staff=True,
                is_superuser=True,
            ),
        )
        director.set_password("demo123")
        director.save(update_fields=["password"])
        titulares = []
        for index, (grade, group_name) in enumerate([(5,"5A"), (5,"5B"), (3,"3A"), (3,"3B")], start=1):
            fn, ln = rname()
            username = safe_username(f"teacher_demo_{index}", f"teacher_demo_{index}")
            email = f"{group_name.lower()}@demo.com"
            u, _ = User.objects.update_or_create(
                email=email,
                school=school,
                defaults=dict(
                    username=username,
                    first_name=fn,
                    last_name=ln,
                    role=Roles.MAESTRO_TITULAR,
                ),
            )
            u.set_password("demo123")
            u.save(update_fields=["password"])
            titulares.append((group_name, grade, u))

        itinerantes = []
        for index, subj in enumerate(["Inglés","Computación","EF"], start=1):
            fn, ln = rname()
            username = safe_username(f"itinerant_demo_{index}", f"itinerant_demo_{index}")
            email = f"{subj.lower()}@demo.com"
            u, _ = User.objects.update_or_create(
                email=email,
                school=school,
                defaults=dict(
                    username=username,
                    first_name=fn,
                    last_name=ln,
                    role=Roles.MAESTRO_ITINERANTE,
                ),
            )
            u.set_password("demo123")
            u.save(update_fields=["password"])
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
        # Grupos del ciclo anterior (sin membresías, solo histórico)
        prev_sy = SchoolYear.objects.filter(school=school, is_current=False).order_by("-start_date").first()
        if prev_sy:
            for group_name, grade, _ in titulares:
                Group.objects.get_or_create(
                    school=school, school_year=prev_sy, name=group_name, grade_level=grade
                )

        # Asignaciones itinerantes a todos los grupos
        for g in groups:
            for subj, teacher in itinerantes:
                SpecialistAssignment.objects.get_or_create(school=school, group=g, teacher=teacher, subject=subj)

        # Alumnos y Padres (User con role=PADRE)
        parents = []
        group_parents = {g: [] for g in groups}
        parent_counter = 1
        for g in groups:
            for _ in range(6):
                fn, ln = rname()
                student = Student.objects.create(
                    school=school, first_name=fn, last_name=ln, grade_level=g.grade_level,
                    enrollment_code=f"ENR{random.randint(1000,9999)}"
                )
                GroupMembership.objects.create(school=school, group=g, student=student)
                pf, pl = rname()
                username = safe_username(f"parent_demo_{parent_counter}", f"parent_demo_{parent_counter}")
                email = f"{student.enrollment_code.lower()}@familia.com"
                parent, _ = User.objects.update_or_create(
                    email=email,
                    school=school,
                    defaults=dict(
                        username=username,
                        first_name=pf,
                        last_name=pl,
                        role=Roles.PADRE,
                    ),
                )
                parent.set_password("demo123")
                parent.save(update_fields=["password"])
                from core.models import ParentStudent
                ParentStudent.objects.get_or_create(
                    school=school, parent=parent, student=student, defaults={"relationship": "tutor"}
                )
                parents.append(parent)
                group_parents[g].append(parent)
                parent_counter += 1

        # Asignar un Vocal por grupo, asegurando rol y relación
        for g in groups:
            p = random.choice(group_parents[g])
            if p.role != Roles.VOCAL:
                p.role = Roles.VOCAL
                p.save(update_fields=["role"])
            VocalAssignment.objects.get_or_create(
                school=school,
                group=g,
                parent=p,
                defaults={"assigned_by": g.homeroom_teacher, "active": True},
            )

        # Eventos (globales y de grupo)
        now = datetime.now(dt_tz.utc)
        events = []
        e1 = Event.objects.create(
            school=school,
            school_year=sy,
            scope="GLOBAL",
            title="Kermés Escolar",
            description="Recaudación general",
            location="Patio",
            start_at=utc(now + timedelta(days=7)),
            end_at=utc(now + timedelta(days=7, hours=3)),
            created_by=director,
            status="ACTIVE",
        )
        events.append(e1)
        e2 = Event.objects.create(
            school=school,
            school_year=sy,
            scope="GLOBAL",
            title="Festival de Invierno",
            description="Programa artístico",
            location="Auditorio",
            start_at=utc(now + timedelta(days=40)),
            end_at=utc(now + timedelta(days=40, hours=2)),
            created_by=director,
            status="ACTIVE",
        )
        events.append(e2)
        e3 = Event.objects.create(
            school=school,
            school_year=sy,
            scope="GLOBAL",
            title="Feria de Ciencias",
            description="Exhibición de proyectos",
            location="Gimnasio",
            start_at=utc(now + timedelta(days=15)),
            end_at=utc(now + timedelta(days=15, hours=4)),
            created_by=director,
            status="CANCELLED",
        )
        events.append(e3)
        for g in groups[:4]:
            eg = Event.objects.create(
                school=school,
                school_year=sy,
                scope="GROUP",
                title=f"Junta {g.name}",
                description="Información a padres",
                location=g.name,
                start_at=utc(now + timedelta(days=random.randint(5, 20))),
                end_at=utc(now + timedelta(days=random.randint(5, 20), hours=1)),
                created_by=g.homeroom_teacher,
                status="ACTIVE",
            )
            EventGroupAudience.objects.create(event=eg, group=g)
            events.append(eg)

        for ev in events:
            EventPhoto.objects.create(
                event=ev,
                photo_url="https://via.placeholder.com/400",
                caption=f"{ev.title} foto",
            )

        # Tareas
        for g in groups:
            Homework.objects.create(
                school=school,
                group=g,
                subject="Español",
                teacher=g.homeroom_teacher,
                title=f"Lectura {g.name}",
                description="Cap. 1-2",
                due_date=utc(now + timedelta(days=3)),
            )
            Homework.objects.create(
                school=school,
                group=g,
                subject="Matemáticas",
                teacher=g.homeroom_teacher,
                title=f"Ejercicios {g.name}",
                description="Resolver problemas 1-5",
                due_date=utc(now + timedelta(days=5)),
            )

        # Avisos
        Announcement.objects.create(
            school=school,
            scope=Announcement.Scope.GLOBAL,
            teacher=director,
            title="Aviso general",
            message="Recordatorio de junta escolar la próxima semana.",
        )
        for g in groups:
            Announcement.objects.create(
                school=school,
                scope=Announcement.Scope.GRUPO,
                group=g,
                teacher=g.homeroom_teacher,
                title=f"Aviso {g.name}",
                message="Revisión de tareas y materiales.",
            )

        # Evidencias
        for g in groups:
            ActivityPhoto.objects.create(school=school, group=g, uploaded_by=g.homeroom_teacher,
                                         photo_url="https://via.placeholder.com/300", caption=f"Actividad {g.name}")

        # Encuestas
        Survey.objects.create(
            school=school,
            created_by=director,
            scope=Survey.Scope.SCHOOL,
            title="Satisfacción general",
            description="¿Cómo evalúas la escuela?",
            options=["Excelente", "Buena", "Regular"],
            is_anonymous=True,
            start_at=utc(now - timedelta(days=1)),
            end_at=utc(now + timedelta(days=14)),
            status=Survey.Status.ACTIVE,
        )
        Survey.objects.create(
            school=school,
            created_by=groups[0].homeroom_teacher,
            scope=Survey.Scope.GROUP,
            group=groups[0],
            title="Destino excursión",
            description="Elige el destino",
            options=["Museo", "Parque"],
            is_anonymous=False,
            start_at=utc(now - timedelta(days=1)),
            end_at=utc(now + timedelta(days=7)),
            status=Survey.Status.ACTIVE,
        )
        Survey.objects.create(
            school=school,
            created_by=groups[1].homeroom_teacher,
            scope=Survey.Scope.GROUP,
            group=groups[1],
            title="Horario de tutorías",
            description="Selecciona el horario preferido",
            options=["Mañana", "Tarde"],
            is_anonymous=False,
            start_at=utc(now - timedelta(days=2)),
            end_at=utc(now + timedelta(days=10)),
            status=Survey.Status.ACTIVE,
        )

        # Quejas y mensajes
        statuses = ["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "CLOSED"]
        for idx, status in enumerate(statuses, start=1):
            c = Complaint.objects.create(
                school=school,
                group=groups[0],
                created_by=random.choice(group_parents[groups[0]]),
                target_teacher=groups[0].homeroom_teacher,
                status=status,
                description=f"Situación reportada #{idx}",
            )
            ComplaintMessage.objects.create(
                complaint=c,
                author=groups[0].homeroom_teacher,
                message="Reviso el caso y doy seguimiento.",
            )

        # Chat de grupo
        chat, _ = GroupChat.objects.get_or_create(group=groups[0])
        ChatMessage.objects.create(chat=chat, author=groups[0].homeroom_teacher,
                                   message_text="Bienvenidos al chat del grupo.")
        ChatMessage.objects.create(chat=chat, author=group_parents[groups[0]][0],
                                   message_text="Gracias por la bienvenida.")

        # Sugerencias (maestros -> director)
        sugg = Suggestion.objects.create(
            school=school,
            group=groups[1],
            created_by=groups[1].homeroom_teacher,
            target_teacher=director,
            title="Material adicional",
            description="Ser?a ?til contar con m?s libros en el aula.",
        )
        SuggestionMessage.objects.create(
            suggestion=sugg,
            author=director,
            message="Gracias, lo revisaremos.",
        )


        # Recaudación y gastos
        fr_event = FundraisingEvent.objects.create(
            school=school, school_year=sy, name="Venta de postres",
            date=today, description="Apoyo para excursión"
        )
        ledger = FundraisingGroupLedger.objects.create(
            event=fr_event, group=groups[0], amount_collected=Decimal("500.00"),
            notes="Recaudado por padres", created_by=groups[0].homeroom_teacher
        )
        ExpenseEvidence.objects.create(
            ledger=ledger, group=groups[0], uploader=groups[0].homeroom_teacher,
            file_url="https://via.placeholder.com/200", amount=Decimal("150.00"),
            concept="Compra de materiales"
        )

        # Preferencias de notificación
        NotificationPreference.objects.get_or_create(
            school=school, user=director, kind=NotificationPreference.Kind.EVENT
        )
        NotificationPreference.objects.get_or_create(
            school=school, user=group_parents[groups[0]][0],
            kind=NotificationPreference.Kind.COMPLAINT, defaults={"enabled": False}
        )
        connection.set_schema_to_public()

        self.stdout.write(self.style.SUCCESS("Seed demo creada. Credenciales:"))
        self.stdout.write("Director: director@demo.com / demo123")
        self.stdout.write("Maestros titulares: 5A@demo.com, 5B@demo.com, 3A@demo.com, 3B@demo.com / demo123")
        self.stdout.write("Itinerantes: ingles@demo.com, computación@demo.com, ef@demo.com / demo123")
