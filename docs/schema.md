# Paginación y filtros

Todas las vistas de lista usan paginación por número de página.

## Parámetros de paginación

- `page`: número de página.
- `page_size`: tamaño de página (máx. 100).

## Filtros disponibles

- **Quejas** (`/api/v1/complaints/`): `status`.
- **Eventos** (`/api/v1/events/`): `from`, `to`, `group_id`, `scope`.
- **Sugerencias** (`/api/v1/suggestions/`): `status`, `date_from`, `date_to`, `group_id`.
- **Chat** (`/api/v1/chats/{group_id}/messages/`): `q`, `author`.
- **Auditoría** (`/api/v1/audit-logs/`): `actor`, `action`, `entity_type`, `date_from`, `date_to`.
