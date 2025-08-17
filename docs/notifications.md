# Notifications API

Gestiona tokens de dispositivo y preferencias de notificación.

## Device tokens

Registra tokens Expo por usuario.

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android"
}
```

- `POST /api/v1/notifications/device-tokens/` – Registra un token de push.
- `GET /api/v1/notifications/device-tokens/list/` – Lista tokens activos del usuario.
- `DELETE /api/v1/notifications/device-tokens/<token>/` – Desactiva un token.

## Payloads
Ejemplo de mensaje enviado a Expo:

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Recordatorio: Reunión",
  "body": "Inicia 2024-01-01 10:00",
  "data": {"type": "event", "event_id": 1}
}
```

## send_event_reminders
La tarea Celery `send_event_reminders` revisa eventos próximos y envía notificaciones push.
Se ejecuta cada hora mediante Celery Beat. Para lanzarla manualmente:

```bash
docker compose run --rm celery celery -A edulinker call core.tasks.send_event_reminders
```

Los offsets se configuran con la variable `EVENT_REMINDER_OFFSETS` (horas separadas por comas).

## Preferences
- `GET /api/v1/notifications/prefs/` – Lista preferencias del usuario.
- `POST /api/v1/notifications/prefs/` – Crea una preferencia.
- `GET /api/v1/notifications/prefs/<id>/` – Obtiene una preferencia.
- `PUT /api/v1/notifications/prefs/<id>/` – Actualiza una preferencia.
- `GET /api/v1/notifications/channels/` – Obtiene configuración de canales (push).
- `PUT /api/v1/notifications/channels/` – Actualiza configuración de canales.
