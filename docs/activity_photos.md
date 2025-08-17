# Fotos de actividades

Gestión de evidencias fotográficas asociadas a grupos o tareas.

## Roles permitidos

- **MAESTRO_TITULAR**, **MAESTRO_ITINERANTE** y vocales activos pueden subir fotos para su grupo.
- Todos los miembros del grupo pueden consultar y descargar las fotos.

## Endpoints

- `GET /api/v1/groups/{id}/activity-photos/` – Lista las fotos de un grupo (incluye las de sus tareas).
- `POST /api/v1/activity-photos/` – Crea un nuevo registro. Requiere `group` o `homework` y `photo_url`.
