# Gestión de grupos

## Endpoints

### Listar grupos

`GET /api/v1/groups/`  
Roles permitidos: todos los usuarios autenticados (filtrado por escuela).

### Crear grupos

`POST /api/v1/groups/create/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `name`
- `grade_level`

**Ejemplo de petición**

```http
POST /api/v1/groups/create/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "3A",
  "grade_level": 3
}
```

**Ejemplo de respuesta**

```json
{
  "id": 5,
  "name": "3A",
  "grade_level": 3
}
```

### Asignar maestro titular

`PATCH /api/v1/groups/{id}/assign-homeroom-teacher/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `homeroom_teacher`: id del maestro titular.

**Ejemplo de petición**

```http
PATCH /api/v1/groups/5/assign-homeroom-teacher/
Authorization: Bearer <token>
Content-Type: application/json

{
  "homeroom_teacher": 51
}
```

### Asignar maestro especialista

`POST /api/v1/groups/{id}/assign-specialist/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `teacher`
- `subject`

**Ejemplo de petición**

```http
POST /api/v1/groups/5/assign-specialist/
Authorization: Bearer <token>
Content-Type: application/json

{
  "teacher": 73,
  "subject": "Music"
}
```

### Listar miembros del grupo

`GET /api/v1/groups/{id}/members/`  
Roles permitidos: **DIRECTOR**, maestro titular del grupo, maestro especialista asignado, vocal activo.

### Asignar vocal

`POST /api/v1/groups/vocal-assignments/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `group`
- `parent`

**Ejemplo de petición**

```http
POST /api/v1/groups/vocal-assignments/
Authorization: Bearer <token>
Content-Type: application/json

{
  "group": 5,
  "parent": 42
}
```

### Desactivar vocal

`PATCH /api/v1/groups/vocal-assignments/{id}/deactivate/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

**Ejemplo de petición**

```http
PATCH /api/v1/groups/vocal-assignments/12/deactivate/
Authorization: Bearer <token>
```
