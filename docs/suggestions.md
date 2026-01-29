# Suggestions API

Gestión de sugerencias y mensajes asociados para mejorar la comunidad escolar.

## Roles permitidos

- **PADRE**, **VOCAL**, **MAESTRO_TITULAR**: pueden crear sugerencias.
- **DIRECTOR**: puede ver todas las sugerencias y actualizar su estado.
- El creador, el docente destinatario y el maestro titular del grupo pueden añadir mensajes.

## Endpoints

- `GET /api/v1/suggestions/` – Lista las sugerencias visibles para el usuario.
- `POST /api/v1/suggestions/` – Crea una sugerencia.
- `GET /api/v1/suggestions/{id}/` – Detalle de una sugerencia.
- `PATCH /api/v1/suggestions/{id}/` – Edita título o descripción (solo el creador).
- `POST /api/v1/suggestions/{id}/messages/` – Agrega un mensaje a la sugerencia.
- `PATCH /api/v1/suggestions/{id}/status/` – Cambia el estado (`OPEN`, `IN_REVIEW`, `CLOSED`).

## Filtros y búsqueda

`GET /api/v1/suggestions/` acepta:

- `name`: nombre/apellido del creador.
- `email`: correo del creador.
- `status`: estado.
- `group_id`: filtra por grupo.
- `date_from`, `date_to`: rango de fechas.
- `page`, `page_size`: paginación.

## Ejemplos

### Crear una sugerencia

```bash
curl -X POST https://api.edulinker.test/api/v1/suggestions/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "group": 5, "target_teacher": 12, "title": "Más excursiones", "description": "Sería bueno..." }'
```

**Respuesta**

`201 Created` – devuelve la sugerencia creada.  
`403 Forbidden` – si el rol no puede crear sugerencias.

### Cambiar estado

```bash
curl -X PATCH https://api.edulinker.test/api/v1/suggestions/10/status/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "status": "IN_REVIEW" }'
```

**Respuesta**

`200 OK` – estado actualizado.  
`403 Forbidden` – si el usuario no es director ni docente destinatario.  
`404 Not Found` – si la sugerencia no existe.

### Listar sugerencias

```js
fetch('/api/v1/suggestions/', {
  headers: { 'Authorization': 'Bearer TOKEN', 'X-SCHOOL-ID': '1' }
}).then(r => r.json());
```

**Respuesta**

`200 OK` – lista de sugerencias visibles para el usuario.  
`403 Forbidden` – si el usuario no pertenece a la escuela.
