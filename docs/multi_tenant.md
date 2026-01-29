# Multi-tenant

La resolución de escuela se realiza en `SchoolMiddleware` con el siguiente orden:

1. Subdominio (ej. `abc.example.com`).
2. Header `X-School-ID`.
3. Token `Authorization: Bearer` (resuelve el usuario y su `school_id`).

Si ninguna opción es válida, se responde `400 Invalid tenant`.

## Pruebas

Se incluyen pruebas para subdominio, header y fallback por Authorization en
`backend/core/tests/test_multitenancy.py`.
