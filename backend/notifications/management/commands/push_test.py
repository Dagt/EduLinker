# backend/notifications/management/commands/push_test.py
from django.core.management.base import BaseCommand
from core.models import User
from notifications.tasks import push_to_users

class Command(BaseCommand):
    help = "Envía un push de prueba a DIRECTOR(es) de la escuela dada"

    def add_arguments(self, parser):
        parser.add_argument("--school-id", type=int, required=True)

    def handle(self, *args, **opts):
        school_id = opts["school_id"]
        ids = list(User.objects.filter(school_id=school_id, role="DIRECTOR").values_list("id", flat=True))
        push_to_users.delay(school_id, ids, "Prueba", "Notificación de prueba", {"type":"test"})
        self.stdout.write(self.style.SUCCESS(f"Push encolado a {len(ids)} usuarios"))
