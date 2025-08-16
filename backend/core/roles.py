from django.db import models


class Roles(models.TextChoices):
    """Centralised list of user roles used across backend and frontend."""
    ADMIN_TENANT = "ADMIN_TENANT", "Admin Tenant"
    DIRECTOR = "DIRECTOR", "Director"
    MAESTRO_TITULAR = "MAESTRO_TITULAR", "Maestro Titular"
    MAESTRO_ITINERANTE = "MAESTRO_ITINERANTE", "Maestro Itinerante"
    VOCAL = "VOCAL", "Vocal"
    PADRE = "PADRE", "Padre"


ALL_ROLES = [role.value for role in Roles]
