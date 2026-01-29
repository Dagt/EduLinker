# Password Reset (Token flow)

Flujo de recuperación de contraseña basado en tokens.

## Endpoints

- `POST /api/v1/auth/password-reset/`
  - Body: `{ "email": "user@example.com" }`
  - Respuesta siempre es genérica para evitar enumeración de usuarios.
  - Throttle: `password_reset_request`.
- `POST /api/v1/auth/password-reset/confirm/`
  - Body: `{ "uid": "...", "token": "...", "new_password": "..." }`
  - Valida token/uid y actualiza contraseña.
  - Throttle: `password_reset_confirm`.

## UI

La web expone pantallas para solicitar reset y confirmar. En móvil se incluye
una pantalla básica para ambos pasos.
