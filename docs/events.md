# Events API

Endpoints para gestionar eventos del calendario.

- `GET /api/v1/events/` – Lista eventos de la escuela.
- `POST /api/v1/events/` – Crea un nuevo evento.
- `GET /api/v1/events/<id>/` – Detalle de un evento.
- `PUT /api/v1/events/<id>/edit/` – Actualiza un evento existente.
- `POST /api/v1/events/<id>/cancel/` – Cancela un evento.
- `GET /api/v1/events/<id>/rsvp/` – Obtiene el RSVP del usuario autenticado.
- `POST /api/v1/events/<id>/rsvp/` – Confirma asistencia (`GOING`, `MAYBE`, `NO`).
- `POST /api/v1/events/<id>/attachments/` – Agrega un archivo adjunto.
- `POST /api/v1/events/<id>/photos/` – Agrega una foto al evento.
- `GET /api/v1/events/ics/` – Exporta los eventos como calendario ICS.

## Exportación mediante token

Cada usuario dispone de un `ics_token` único generado al crearse. Este token
permite descargar el calendario sin autenticación:

```
GET /api/v1/events/ics/?token=<ics_token>
```

El valor del token puede consultarse en el perfil del usuario (por ejemplo
mediante la API de usuarios) y debe mantenerse privado.

## Recordatorios

Los recordatorios de eventos se envían automáticamente a las horas
especificadas en la variable de entorno `EVENT_REMINDER_OFFSETS`. El valor
se define como una lista de horas separadas por comas (por ejemplo,
`EVENT_REMINDER_OFFSETS=48,24,1`).

Por defecto se envían recordatorios 24 y 1 horas antes del inicio del
evento.
