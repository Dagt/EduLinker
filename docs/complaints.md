# Complaints API

Gestión de quejas privadas entre padres, docentes y dirección.

## Roles permitidos

- **PADRE**: puede crear quejas y añadir mensajes.
- **MAESTRO_TITULAR / MAESTRO_ITINERANTE**: pueden ver quejas donde son destinatarios o participantes y añadir mensajes.
- **DIRECTOR**: puede ver todas las quejas y actualizar su estado.
- Participantes explícitos pueden añadirse mediante el endpoint de participantes.

## Endpoints

- `GET /api/v1/complaints/` – Lista las quejas visibles para el usuario.
- `POST /api/v1/complaints/` – Crea una queja.
- `GET /api/v1/complaints/{id}/` – Detalle de la queja.
- `POST /api/v1/complaints/{id}/messages/` – Agrega un mensaje a la queja.
- `POST /api/v1/complaints/{id}/participants/` – Agrega un participante a la queja.
- `PATCH /api/v1/complaints/{id}/status/` – Cambia el estado (`OPEN`, `IN_REVIEW`, `ESCALATED`, `RESOLVED`, `CLOSED`).

## Filtros y búsqueda

`GET /api/v1/complaints/` acepta:

- `name`: nombre/apellido del creador.
- `email`: correo del creador.
- `status`: estado.
- `page`, `page_size`: paginación.

## Ejemplos

### Crear una queja

```bash
curl -X POST https://api.edulinker.test/api/v1/complaints/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "group": 5, "target_teacher": 12, "description": "El grupo necesita más seguimiento", "about_student": 42 }'
```

**Respuesta**

`201 Created` – devuelve la queja creada.  
`403 Forbidden` – si el usuario no es padre o el maestro no pertenece al grupo.

### Enviar un mensaje

```bash
curl -X POST https://api.edulinker.test/api/v1/complaints/10/messages/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Gracias por revisar el caso", "attachments": [] }'
```

**Respuesta**

`201 Created` – mensaje creado.  
`403 Forbidden` – si el usuario no participa en la queja.

### Cambiar estado

```bash
curl -X PATCH https://api.edulinker.test/api/v1/complaints/10/status/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "status": "IN_REVIEW" }'
```

**Respuesta**

`200 OK` – estado actualizado.  
`403 Forbidden` – si el usuario no es director ni maestro destinatario.  
`404 Not Found` – si la queja no existe.
