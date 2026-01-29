# Logs de auditoría

## Endpoint

`GET /api/v1/audit-logs/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

## Filtros disponibles

- `actor`: id, username o email del usuario.
- `action`: acción registrada (p. ej. `create`, `update`, `status_change`).
- `entity_type`: tipo de entidad (`user`, `student`, `event`, etc.).
- `date_from`: fecha o fecha-hora ISO (inicio).
- `date_to`: fecha o fecha-hora ISO (fin).
- `page`, `page_size`: paginación.
