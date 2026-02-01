# Guía de prueba de EduLinker

Esta guía resume cómo ejecutar el proyecto localmente, credenciales de demo y
flujos recomendados para probar funcionalidades clave.

## Cómo correrlo (rápido con Docker)

1) Copia variables de entorno:

```bash
cp docs/backend.env.example backend/.env
cp docs/web.env.example web/.env
cp docs/mobile.env.example mobile/.env
```

2) Levanta todo:

```bash
docker compose up --build
```

3) En otra terminal, migra (multi-tenant) y carga datos demo:

```bash
docker compose exec api python manage.py migrate_schemas --shared
docker compose exec api python manage.py migrate_schemas
docker compose exec api python manage.py seed_demo
```

4) URLs útiles:

- Web: http://localhost:3000
- API: http://localhost:8000
- Docs API: http://localhost:8000/api/docs
- MinIO consola: http://localhost:9001 (usuario: `minio`, pass: `minio123`)
- S3 público MinIO (para ver adjuntos): http://localhost:9000/edulinker

Fuente: `README.md`, `docker-compose.yml`, `docs/README.md`.

## Accesos de prueba (seed demo)

Password para todos: `demo123`

- Director: `director@demo.com`
- Maestros titulares: `5A@demo.com`, `5B@demo.com`, `3A@demo.com`, `3B@demo.com`
- Itinerantes: `ingles@demo.com`, `computación@demo.com`, `ef@demo.com`
- Padres: `<codigo_de_inscripcion>@familia.com` (se crea como `ENR####@familia.com`)
- Escuela demo: “Colegio Demo” (subdominio `demo`)

Fuente: `README.md`, `backend/core/management/commands/seed_demo.py`.

## Cómo probar funcionalidades (flujo recomendado)

1) Director (panel web):
- Ver analíticas (quejas, eventos, recaudación, encuestas).
- Crear anuncio global.
- Crear evento global y revisar RSVP.
- Crear encuesta global.
- Ver logs de auditoría.

2) Maestro titular (web o móvil):
- Crear tarea para su grupo.
- Crear anuncio de grupo.
- Abrir chat de grupo y enviar mensajes.
- Revisar y responder quejas/sugerencias.

3) Vocal:
- Registrar ingresos de recaudación.
- Subir evidencia de gasto.

4) Padre:
- Enviar queja o sugerencia.
- Votar encuesta activa.
- Confirmar asistencia a evento (RSVP).
- Suscribirse al calendario (ICS).

## Resumen de módulos/funcionalidades

- Multi-tenant por escuela (subdominio, `X-SCHOOL-ID` o token): `docs/multi_tenant.md`.
- Usuarios/roles y permisos (Director, Maestro titular/itinerante, Vocal, Padre, Admin Tenant): `docs/permissions.md`, `docs/users.md`.
- Grupos y asignación de docentes/vocales: `docs/groups.md`.
- Alumnos y relación padre–alumno: `docs/students.md`, `docs/parent_students.md`.
- Anuncios: `docs/announcements.md`.
- Tareas: `docs/homeworks.md`.
- Eventos + RSVP + ICS calendario: `docs/events.md`, `docs/calendars.md`.
- Chat en tiempo real por grupo (WebSocket): `docs/chat.md`.
- Quejas privadas: `docs/complaints.md`.
- Sugerencias: `docs/suggestions.md`.
- Encuestas: `docs/surveys.md`.
- Recaudaciones y evidencias: `docs/fundraising.md`.
- Analíticas: `docs/analytics.md`.
- Notificaciones (Expo push + preferencias): `docs/notifications.md`.
- Logs de auditoría: `docs/audit_logs.md`.
- Fotos de actividades (seeded): `backend/core/management/commands/seed_demo.py`.

## Probar la API con token (si usas Postman/cURL)

- Login JWT: `POST /api/v1/auth/login/`
- Refresh: `POST /api/v1/auth/refresh/`
- Perfil: `GET /api/v1/me/` (devuelve `school_id` y `ics_token`)
- En la mayoría de endpoints se recomienda enviar `X-SCHOOL-ID` además del token.

Las rutas exactas y payloads están en `docs/openapi.json` y en
`http://localhost:8000/api/docs`.

## Mobile (Expo)

```bash
cd mobile
cp env.example .env
npm install
npx expo start
```

Si pruebas en móvil físico, apunta `API_URL` al IP de tu máquina (no
`localhost`).
