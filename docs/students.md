# Gestión de alumnos

## Endpoints

### Listar y crear alumnos

`GET /api/v1/students/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Filtros disponibles:

- `name`: nombre o apellido.
- `grade_level`: grado (número).
- `page`, `page_size`: paginación.

**Ejemplo de petición**

```http
GET /api/v1/students/?grade_level=3&page=1
Authorization: Bearer <token>
```

**Ejemplo de respuesta**

```json
[
  {
    "id": 10,
    "first_name": "Lucía",
    "last_name": "Ramírez",
    "grade_level": 3,
    "enrollment_code": "ALU-2024-001",
    "group_ids": [5]
  }
]
```

`POST /api/v1/students/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos habituales:

- `first_name`, `last_name`, `grade_level`, `enrollment_code`.
- `group_id` (opcional): asigna al grupo.
- `allow_multiple_groups` (opcional): permite múltiples grupos en el mismo ciclo.

**Ejemplo de petición**

```http
POST /api/v1/students/
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Carlos",
  "last_name": "Soto",
  "grade_level": 2,
  "enrollment_code": "ALU-2024-002",
  "group_id": 5,
  "allow_multiple_groups": false
}
```

**Ejemplo de respuesta**

```json
{
  "id": 11,
  "first_name": "Carlos",
  "last_name": "Soto",
  "grade_level": 2,
  "enrollment_code": "ALU-2024-002",
  "group_ids": [5]
}
```

### Actualizar alumno

`PATCH /api/v1/students/{id}/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

### Actualizar membresías de grupo

`PATCH /api/v1/students/{id}/groups/`

Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `group_ids`: lista de IDs de grupos destino.
- `replace_existing`: `true` para reemplazar, `false` para agregar.
- `allow_multiple_groups`: permite múltiples grupos en el mismo ciclo escolar.

**Advertencia**: si `allow_multiple_groups` es `false` y se envían múltiples `group_ids`, la API debe rechazar la solicitud.

**Ejemplo de petición**

```http
PATCH /api/v1/students/11/groups/
Authorization: Bearer <token>
Content-Type: application/json

{
  "group_ids": [5, 6],
  "replace_existing": true,
  "allow_multiple_groups": true
}
```

**Ejemplo de respuesta**

```json
{
  "student": 11,
  "group_ids": [5, 6]
}
```

### Asignar padres a alumnos

`GET /api/v1/parent-students/`  
`POST /api/v1/parent-students/`

Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `parent`: id del usuario padre/madre.
- `student`: id del alumno.
- `relationship`: relación (p. ej. `mother`, `father`, `guardian`).

**Ejemplo de petición**

```http
POST /api/v1/parent-students/
Authorization: Bearer <token>
Content-Type: application/json

{
  "parent": 42,
  "student": 11,
  "relationship": "mother"
}
```

**Ejemplo de respuesta**

```json
{
  "id": 19,
  "parent": 42,
  "student": 11,
  "relationship": "mother"
}
```

### Eliminar relación padre-alumno

`DELETE /api/v1/parent-students/{id}/`
