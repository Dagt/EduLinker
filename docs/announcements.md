# Announcements API

Comunicación estructurada con acuse de lectura para dirección y docentes.

## Modelo

`Announcement` ahora incluye:

- `requires_ack` (bool)
- `ack_deadline` (datetime nullable)
- `locked` (bool)

Nuevo modelo `AnnouncementRead` con unicidad `(announcement, user)`.

## Endpoints

- `POST /api/v1/announcements/{id}/ack/`: confirma lectura.
- `GET /api/v1/announcements/{id}/ack-stats/` (DIRECTOR, ADMIN_TENANT): métricas de lectura y no leídos.

## Multi-tenant

- Todos los accesos filtran por `school_id`.
- `ack-stats` solo devuelve audiencia del tenant actual.
