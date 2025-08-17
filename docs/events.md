# Events API

Endpoints para gestionar eventos del calendario.

- `GET /api/v1/events/` – Lista eventos de la escuela.
- `POST /api/v1/events/` – Crea un nuevo evento.
- `GET /api/v1/events/<id>/` – Detalle de un evento.
- `PUT /api/v1/events/<id>/edit/` – Actualiza un evento existente.
- `POST /api/v1/events/<id>/cancel/` – Cancela un evento.
- `POST /api/v1/events/<id>/attachments/` – Agrega un archivo adjunto.
- `POST /api/v1/events/<id>/photos/` – Agrega una foto al evento.
- `GET /api/v1/events/ics/` – Exporta los eventos como calendario ICS.

## Recordatorios

Los recordatorios de eventos se envían automáticamente a las horas
especificadas en la variable de entorno `EVENT_REMINDER_OFFSETS`. El valor
se define como una lista de horas separadas por comas (por ejemplo,
`EVENT_REMINDER_OFFSETS=48,24,1`).

Por defecto se envían recordatorios 24 y 1 horas antes del inicio del
evento.
