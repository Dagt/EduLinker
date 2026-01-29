# Security

## Throttling

Se aplican límites de tasa para proteger endpoints sensibles:

- `login`: `5/min`
- `password_reset_request`: `5/hour`
- `password_reset_confirm`: `5/hour`
- `chat`: `60/min`

Configurable en `backend/edulinker/settings.py`.

## Soft-delete y anonimización

Se agregaron endpoints administrativos:

- `POST /api/v1/users/{id}/deactivate/` → desactiva el usuario (`is_active=false`).
- `POST /api/v1/users/{id}/anonymize/` → anonimiza nombre/email/teléfono y desactiva.

Ambos registran AuditLog y requieren rol `ADMIN_TENANT`.
