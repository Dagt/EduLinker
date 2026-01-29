# Gestión de alumnos

## Endpoints

### Listar y crear alumnos

`GET /api/v1/students/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Filtros disponibles:

- `name`: nombre o apellido.
- `grade_level`: grado (número).
- `page`, `page_size`: paginación.

`POST /api/v1/students/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos habituales:

- `first_name`, `last_name`, `grade_level`, `enrollment_code`.
- `group_id` (opcional): asigna al grupo.
- `allow_multiple_groups` (opcional): permite múltiples grupos en el mismo ciclo.

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

### Asignar padres a alumnos

`GET /api/v1/parent-students/`  
`POST /api/v1/parent-students/`

Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `parent`: id del usuario padre/madre.
- `student`: id del alumno.
- `relationship`: relación (p. ej. `mother`, `father`, `guardian`).

### Eliminar relación padre-alumno

`DELETE /api/v1/parent-students/{id}/`
