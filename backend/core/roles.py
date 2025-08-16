from django.db.models import TextChoices


class Roles(TextChoices):
    """Application-wide user roles."""

    ADMIN_TENANT = "ADMIN_TENANT", "Administrador del tenant"
    DIRECTOR = "DIRECTOR", "Director"
    MAESTRO_TITULAR = "MAESTRO_TITULAR", "Maestro Titular"
    MAESTRO_ITINERANTE = "MAESTRO_ITINERANTE", "Maestro Itinerante"
    VOCAL = "VOCAL", "Vocal"
    PADRE = "PADRE", "Padre"


__all__ = ["Roles"]
