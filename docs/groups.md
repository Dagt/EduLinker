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

### Asignar maestro titular

`PATCH /api/v1/groups/{id}/assign-homeroom-teacher/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `homeroom_teacher`: id del maestro titular.

### Asignar maestro especialista

`POST /api/v1/groups/{id}/assign-specialist/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `teacher`
- `subject`

### Listar miembros del grupo

`GET /api/v1/groups/{id}/members/`  
Roles permitidos: **DIRECTOR**, maestro titular del grupo, maestro especialista asignado, vocal activo.

### Asignar vocal

`POST /api/v1/groups/vocal-assignments/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos:

- `group`
- `parent`

### Desactivar vocal

`PATCH /api/v1/groups/vocal-assignments/{id}/deactivate/`  
Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.
