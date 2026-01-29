# Gestión de usuarios

## Endpoints

### Listar usuarios

`GET /api/v1/users/`

Roles permitidos: **DIRECTOR** (solo de su escuela) y **ADMIN_TENANT** (todas sus escuelas).  
Parámetros de filtro (opcional):

- `name`: nombre o apellido.
- `email`: correo.
- `status`: `active` / `inactive`.
- `role`: rol exacto (p. ej. `PADRE`, `MAESTRO_TITULAR`).
- `page`, `page_size`: paginación.

### Crear usuario

`POST /api/v1/users/`

Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos típicos:

- `email`, `username`, `first_name`, `last_name`.
- `role` (si lo asigna **ADMIN_TENANT**).
- `is_active` (opcional).

### Actualizar rol/estado

`PATCH /api/v1/users/{id}/role/`

Roles permitidos: **ADMIN_TENANT** (cambio de rol y activación/desactivación).

Campos:

- `role`: rol destino.
- `is_active`: `true/false`.

## Contraseñas

### Cambio de contraseña (usuario autenticado)

`POST /api/v1/auth/change-password/`

Campos:

- `current_password`
- `new_password`
- `confirm_password`

### Restablecer contraseña

`POST /api/v1/auth/password-reset/`

Campos: `email`.

### Confirmar restablecimiento

`POST /api/v1/auth/password-reset/confirm/`

Campos:

- `uid`
- `token`
- `new_password`
