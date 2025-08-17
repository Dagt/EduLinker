# Chat API

Gestión de mensajes dentro de un grupo.

## Roles permitidos

- **ADMIN_TENANT**: puede leer todos los chats pero no enviar mensajes.
- **DIRECTOR**: puede leer chats de todos los grupos de la escuela pero no enviar mensajes.
- **MAESTRO_TITULAR**: puede leer y enviar mensajes en los grupos que tutela.
- **MAESTRO_ITINERANTE**: puede leer y enviar mensajes en los grupos donde está asignado.
- **VOCAL**: puede leer y enviar mensajes en los grupos donde fue designado.
- **PADRE**: puede leer y enviar mensajes en los grupos de sus hijos.

## Endpoints

- `GET /api/v1/chats/{group_id}/messages/` – Lista los mensajes del grupo. Acepta el
  parámetro opcional `audit`, que si se incluye y el usuario es Director, registra
  la lectura en el registro de auditoría.
- `POST /api/v1/chats/{group_id}/messages/` – Envía un nuevo mensaje.
