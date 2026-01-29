# Gestión de usuarios

## Endpoints

### Listar usuarios

`GET /api/v1/users/`

Roles permitidos:

- **DIRECTOR**: solo usuarios de su escuela.
- **ADMIN_TENANT**: usuarios de todas las escuelas del tenant.

Parámetros de filtro (opcional):

- `name`: nombre o apellido.
- `email`: correo.
- `status`: `active` / `inactive`.
- `role`: rol exacto (p. ej. `PADRE`, `MAESTRO_TITULAR`).
- `page`, `page_size`: paginación.

**Ejemplo de petición**

```http
GET /api/v1/users/?role=PADRE&status=active&page=1&page_size=20
Authorization: Bearer <token>
```

**Ejemplo de respuesta**

```json
[
  {
    "id": 42,
    "email": "madre@example.com",
    "first_name": "Ana",
    "last_name": "Pérez",
    "role": "PADRE",
    "is_active": true,
    "school": 3
  }
]
```

### Crear usuario

`POST /api/v1/users/`

Roles permitidos: **DIRECTOR** y **ADMIN_TENANT**.

Campos típicos:

- `email`, `username`, `first_name`, `last_name`.
- `role` (si lo asigna **ADMIN_TENANT**).
- `is_active` (opcional).

**Ejemplo de petición**

```http
POST /api/v1/users/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "docente@example.com",
  "username": "docente01",
  "first_name": "Mario",
  "last_name": "Gómez",
  "role": "MAESTRO_TITULAR",
  "is_active": true
}
```

**Ejemplo de respuesta**

```json
{
  "id": 51,
  "email": "docente@example.com",
  "first_name": "Mario",
  "last_name": "Gómez",
  "role": "MAESTRO_TITULAR",
  "is_active": true,
  "school": 3
}
```

### Actualizar rol/estado

`PATCH /api/v1/users/{id}/role/`

Roles permitidos: **ADMIN_TENANT** (cambio de rol y activación/desactivación).

Campos:

- `role`: rol destino.
- `is_active`: `true/false`.

**Ejemplo de petición**

```http
PATCH /api/v1/users/51/role/
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "MAESTRO_ESPECIALISTA",
  "is_active": false
}
```

**Ejemplo de respuesta**

```json
{
  "id": 51,
  "email": "docente@example.com",
  "role": "MAESTRO_ESPECIALISTA",
  "is_active": false
}
```

## Contraseñas

### Cambio de contraseña (usuario autenticado)

`POST /api/v1/auth/change-password/`

Roles permitidos: cualquier usuario autenticado.

Campos:

- `current_password`
- `new_password`
- `confirm_password`

### Restablecer contraseña

`POST /api/v1/auth/password-reset/`

Roles permitidos: público (sin autenticación).

Campos: `email`.

**Ejemplo de petición**

```http
POST /api/v1/auth/password-reset/
Content-Type: application/json

{
  "email": "madre@example.com"
}
```

**Ejemplo de respuesta**

```json
{
  "detail": "Password reset e-mail has been sent."
}
```

### Confirmar restablecimiento

`POST /api/v1/auth/password-reset/confirm/`

Roles permitidos: público (sin autenticación).

Campos:

- `uid`
- `token`
- `new_password`

**Ejemplo de petición**

```http
POST /api/v1/auth/password-reset/confirm/
Content-Type: application/json

{
  "uid": "Mg",
  "token": "set-password-token",
  "new_password": "NuevaClaveSegura123"
}
```

**Ejemplo de respuesta**

```json
{
  "detail": "Password has been reset with the new password."
}
```
