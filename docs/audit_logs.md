# Logs de auditoría

## Endpoint

`GET /api/v1/audit-logs/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

## Campos principales del AuditLog

- `id`: identificador del evento.
- `actor`: usuario que ejecutó la acción (id, email o username según el serializer).
- `action`: acción registrada (`create`, `update`, `status_change`, `delete`, etc.).
- `entity_type`: tipo de entidad (`user`, `student`, `group`, `event`, etc.).
- `entity_id`: id de la entidad afectada.
- `message`: resumen legible del evento.
- `metadata`: información adicional (sin datos sensibles).
- `created_at`: fecha/hora del evento.

## Filtros disponibles

- `actor`: id, username o email del usuario.
- `action`: acción registrada (p. ej. `create`, `update`, `status_change`).
- `entity_type`: tipo de entidad (`user`, `student`, `event`, etc.).
- `date_from`: fecha o fecha-hora ISO (inicio).
- `date_to`: fecha o fecha-hora ISO (fin).
- `page`, `page_size`: paginación.

## Ejemplos

**Ejemplo de petición**

```http
GET /api/v1/audit-logs/?entity_type=student&action=create&date_from=2024-01-01
Authorization: Bearer <token>
```

**Ejemplo de respuesta**

```json
[
  {
    "id": 900,
    "actor": {
      "id": 12,
      "email": "director@example.com"
    },
    "action": "create",
    "entity_type": "student",
    "entity_id": 11,
    "message": "Student created",
    "metadata": {
      "grade_level": 2
    },
    "created_at": "2024-02-15T10:30:00Z"
  }
]
```
