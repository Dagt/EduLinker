# Notifications API

Gestiona tokens de dispositivo y preferencias de notificación.

## Device tokens
- `POST /api/v1/notifications/device-tokens/` – Registra un token de push.
- `GET /api/v1/notifications/device-tokens/list/` – Lista tokens activos del usuario.
- `DELETE /api/v1/notifications/device-tokens/<token>/` – Desactiva un token.

## Preferences
- `GET /api/v1/notifications/prefs/` – Lista preferencias del usuario.
- `POST /api/v1/notifications/prefs/` – Crea una preferencia.
- `GET /api/v1/notifications/prefs/<id>/` – Obtiene una preferencia.
- `PUT /api/v1/notifications/prefs/<id>/` – Actualiza una preferencia.
- `GET /api/v1/notifications/channels/` – Obtiene configuración de canales (push/email).
- `PUT /api/v1/notifications/channels/` – Actualiza configuración de canales.
