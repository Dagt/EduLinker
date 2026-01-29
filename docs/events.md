# Events API

Endpoints para gestionar eventos del calendario.

- `GET /api/v1/events/` – Lista eventos de la escuela.
- `POST /api/v1/events/` – Crea un nuevo evento.
- `GET /api/v1/events/<id>/` – Detalle de un evento.
- `PUT /api/v1/events/<id>/edit/` – Actualiza un evento existente.
- `POST /api/v1/events/<id>/cancel/` – Cancela un evento.
- `GET /api/v1/events/<id>/rsvp/` – Obtiene el RSVP del usuario autenticado.
- `POST /api/v1/events/<id>/rsvp/` – Confirma asistencia (`YES`, `MAYBE`, `NO`).
- `POST /api/v1/events/<id>/attachments/` – Agrega un archivo adjunto.
- `POST /api/v1/events/<id>/photos/` – Agrega una foto al evento.
- `GET /api/v1/events/ics/` – Exporta los eventos como calendario ICS.

## Filtros y búsqueda

`GET /api/v1/events/` acepta:

- `name`: título o nombre del creador.
- `email`: correo del creador.
- `status`: `ACTIVE`, `CANCELLED`, `PAST`.
- `from`, `to`: rango de fechas (ISO).
- `group_id`: filtra por grupo.
- `scope`: `GLOBAL` o `GROUP`.
- `page`, `page_size`: paginación.

## Exportación mediante token

Cada usuario dispone de un `ics_token` único generado al crearse. Este token
permite descargar el calendario sin autenticación:

```
GET /api/v1/events/ics/?token=<ics_token>&school_id=<id>
```

El valor del token puede consultarse en el endpoint `/api/v1/me/` y debe
mantenerse privado. El link de suscripción tiene acceso completo al calendario
del usuario.

Para instrucciones de suscripción en Google Calendar y Outlook revisa
`docs/calendars.md`.

## RSVP

El RSVP permite que padres y maestros confirmen su asistencia. El endpoint
requiere el encabezado `X-SCHOOL-ID` y valida que el usuario tenga acceso al
evento:

```
GET /api/v1/events/45/rsvp/
```

Respuesta:

```json
{ "status": "YES" }
```

Para responder:

```
POST /api/v1/events/45/rsvp/
```

```json
{ "status": "MAYBE" }
```

Solo usuarios con acceso al evento pueden consultar o actualizar su RSVP.

## Recordatorios

Los recordatorios de eventos se envían automáticamente a las horas
especificadas en la variable de entorno `EVENT_REMINDER_OFFSETS`. El valor
se define como una lista de horas separadas por comas (por ejemplo,
`EVENT_REMINDER_OFFSETS=48,24,1`).

Por defecto se envían recordatorios 24 y 1 horas antes del inicio del
evento.
