# EDULINKER  
## Especificación Maestra del Proyecto

---

# 1. VISIÓN Y PROBLEMA A RESOLVER

## 1.1 El problema real

Las escuelas no fallan por falta de tecnología, fallan por:

- Comunicación informal y desordenada  
- Falta de jerarquía clara  
- Cero trazabilidad de decisiones y conflictos  
- Conflictos emocionales mal canalizados  
- Pérdida de tiempo del director  
- Desconfianza entre padres, maestros y vocales  

Actualmente la operación escolar se sostiene con WhatsApp, Excel, llamadas y reuniones improvisadas.  
Esto genera fricción constante, desgaste institucional y riesgos legales.

---

## 1.2 Qué es EduLinker

EduLinker es un **sistema de gobernanza escolar**.

Centraliza la comunicación, la organización, la evidencia y la analítica en una plataforma estructurada,
auditable y escalable, diseñada para escuelas primarias.

---

## 1.3 Qué NO es EduLinker

- No es WhatsApp  
- No es una red social  
- No es un ERP genérico  
- No es solo para maestros  

---

# 2. EL CORAZÓN DEL SISTEMA

EduLinker se basa en tres principios fundamentales:

## 2.1 Comunicación estructurada

Cada interacción tiene su canal específico:
- Avisos
- Tareas
- Encuestas
- Quejas privadas
- Eventos
- Recaudaciones
- Chat por grupo

Nada se mezcla.

## 2.2 Jerarquía funcional

Cada rol tiene responsabilidades claras.
Los problemas se atienden primero en el nivel correcto y solo escalan cuando es necesario.

## 2.3 Trazabilidad total

Todo queda registrado:
- Quién
- Cuándo
- Por qué
- Evidencia
- Resultado

---

# 3. ROLES Y RESPONSABILIDADES

## Director
Rol estratégico y de supervisión.
Ve todo, interviene solo cuando es necesario y toma decisiones con datos.

## Maestro Titular
Responsable operativo del grupo.
Publica tareas, atiende quejas y coordina con vocales.

## Maestro Itinerante
Responsable de su materia.
Interactúa solo con los grupos donde imparte clase.

## Vocal
Representante operativo de los padres.
Gestiona encuestas, recaudaciones y evidencias.

## Padre/Madre
Usuario informativo.
Recibe información clara y puede levantar quejas privadas formales.

---

# 4. ESCENARIOS REALES

## Queja escolar
Padre → Maestro → Escalamiento automático → Director

## Recaudación
Vocal registra → Evidencia → Validación → Supervisión

## Evento
Calendario → Notificaciones → Evidencias

---

# 5. ARQUITECTURA Y STACK

## Backend
- Python 3.11
- Django 5
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- JWT
- Multi-tenant por escuela

## Web Dirección
- Next.js 14
- TypeScript

## App Móvil
- React Native (Expo)
- TypeScript

## Infraestructura
- Docker
- Docker Compose
- GitHub Actions
- Kubernetes (opcional)

---

# 6. MÓDULOS DEL SISTEMA

- Usuarios y roles
- Escuelas (tenants)
- Ciclos escolares
- Grupos
- Avisos y tareas
- Quejas privadas
- Encuestas
- Recaudaciones
- Calendario escolar
- Evidencias
- Chat por grupo
- Analítica
- Auditoría

---

# 7. MODELO MENTAL

- Todo pertenece a una escuela
- Todo ocurre dentro de un ciclo
- Los grupos son el eje
- Los padres existen a través de sus hijos
- Los permisos dependen del rol y contexto

---

# 8. OBJETIVO FINAL

Que una escuela pueda decir:

“Aquí todo está claro, documentado y cada quien sabe qué hacer.”

Ese es EduLinker.


# EduLinker — Definición, Alcance y Especificación Funcional/Técnica (v1)

> **Propósito del documento**: consolidar *todo* lo definido hasta ahora sobre EduLinker: objetivo, alcance, módulos, roles/permisos, modelo de datos, API, reglas de negocio, anexos (Calendario + Evidencias; Chat por grupo), no-funcionales, pruebas, CI/CD y despliegue.  
> **Audiencia**: producto, desarrollo backend/frontend/móvil, QA, DevOps.

---

## 1) Visión del producto

### 1.1 ¿Qué es EduLinker?
**EduLinker** es un sistema **multi-tenant por escuela** para mejorar y formalizar la comunicación y operación escolar entre:
- **Dirección** (principal pagador y usuario clave del panel web),
- **Maestros** (titulares e itinerantes),
- **Vocales** (padres/madres representantes por grupo),
- **Padres de familia**.

El sistema sustituye el caos típico de WhatsApp/hojas sueltas por un flujo **estructurado**, auditable y medible.

### 1.2 Problemas que resuelve
- Comunicación informal y dispersa (WhatsApp) sin trazabilidad.
- Conflictos por organización de eventos y recaudaciones (kermés).
- Quejas “en persona” que saturan Dirección y no tienen seguimiento.
- Falta de transparencia y evidencia en gastos/recaudaciones.
- Falta de tablero de analítica para Dirección (visibilidad de riesgos, grupos problemáticos, participación, etc.).

### 1.3 Objetivos de negocio
- Monetización vía **suscripción por escuela** (SaaS).
- Aumentar retención por valor directo a Dirección: **panel analítico**, auditoría y reducción de fricción operativa.
- Escalabilidad multi-escuela con aislamiento estricto por tenant.

---

## 2) Alcance del sistema

### 2.1 Entregables (repositorio monorepo recomendado)
Estructura objetivo:

```
/backend      # Django + DRF + Postgres + Redis + Celery + OpenAPI
/web          # Next.js (Dirección)
/mobile       # Expo RN (Maestros/Vocales/Padres)
/docs         # Documentación, casos de uso, despliegue
```

### 2.2 Plataformas
- **Web Dirección**: panel completo en computadora (Next.js + TS).
- **App móvil**: para maestros, vocales y padres (Expo + TS).
- (Opcional) portal web de sólo lectura para padres, si se decide más adelante.

### 2.3 Principales funcionalidades (MVP+)
1. **Multi-tenancy por escuela** (subdominios o `X-School-ID`).
2. **RBAC estricto** con permisos por rol y por pertenencia al grupo.
3. **Gestión de ciclos escolares** (SchoolYear) y asignaciones por ciclo.
4. **Comunicación estructurada**: avisos, tareas, encuestas.
5. **Quejas privadas** con escalamiento, participantes y auditoría.
6. **Recaudaciones/kermés** con evidencias de gastos.
7. **Calendario escolar** (global y por grupo) + fotos de evidencia.
8. **Chat por grupo** con acceso auditor del Director.
9. **Analítica Dirección**: KPIs, rankings y tendencias.

---

## 3) Stack, arquitectura y estándares

### 3.1 Stack
**Backend**
- Python 3.11
- Django 5 + Django REST Framework (DRF)
- PostgreSQL
- Redis (cache/colas)
- Celery (jobs)
- JWT: `djangorestframework-simplejwt`
- OpenAPI: `drf-spectacular`
- Multi-tenancy: `django-tenants` o `django-tenant-users` (objetivo final con subdominios tipo `colegioX.edulinker.com`)
  - En dev/MVP puede coexistir soporte por header `X-School-ID`.

**Web (Dirección)**
- React 18 + **Next.js 14** + TypeScript

**Móvil**
- React Native **Expo** + TypeScript

**Notificaciones**
- Email (SMTP)
- Push (Expo Push)
- (Opcional) SMS/WhatsApp mediante adaptadores (interfaces)

**Evidencias / archivos**
- Almacenamiento S3 compatible (MinIO en dev, S3 en prod)
- URLs firmadas para descargas/subidas

**Infra**
- Docker Compose para dev
- Dockerfiles por servicio
- (Opcional) manifests K8s para staging/prod

**Calidad**
- Testing: Pytest (backend), Jest/RTL (web/móvil)
- Cobertura: mínima 80%
- CI: GitHub Actions (lint, tests, build)

### 3.2 Arquitectura (alto nivel)
- Backend REST API `/api/v1/`
- Autenticación JWT
- Capa de permisos RBAC + permisos a nivel de objeto (quejas)
- Tareas asíncronas Celery (escalamientos y recordatorios)
- Auditoría con `AuditLog`
- Multi-tenant por subdominio (objetivo), con fallback por header en dev/test

---

## 4) Multi-tenancy (Escuelas)

### 4.1 Principios
- Cada **School (tenant)** tiene su propio espacio lógico: usuarios, grupos, encuestas, quejas, eventos, recaudaciones, etc.
- Aislamiento: **todas** las queries deben filtrar por `school_id` (o por tenant schema si se usa `django-tenants`).
- Resolución de tenant:
  - **Producción**: por subdominio `tenant.edulinker.com`.
  - **Desarrollo/QA**: por header `X-School-ID` (y/o subdominio local).

### 4.2 Ciclos escolares (SchoolYear)
- `SchoolYear` con rango de fechas y `is_current`.
- Al cambiar de ciclo:
  - se crean/actualizan grupos,
  - se reasignan maestros/vocales,
  - se preserva histórico en ciclos previos.
- **Management command**: `rollover_school_year` con validaciones y reporte de cambios.

---

## 5) Roles y permisos (RBAC)

### 5.1 Roles
- **DIRECTOR**: visión total; gestiona todo; auditor de quejas privadas; ve recaudaciones y analítica.
- **MAESTRO_TITULAR**: titular de 1..n grupos; publica avisos/tareas; gestiona quejas de sus grupos; asigna/revoca vocales; coordina recaudaciones con vocales.
- **MAESTRO_ITINERANTE**: especialista (Inglés/Computación/EF); publica avisos/tareas **solo** en grupos donde está asignado; atiende quejas relacionadas a su clase; **no** asigna vocales ni gestiona recaudaciones.
- **VOCAL**: padre/madre asignado por maestro titular; crea encuestas; registra recaudaciones; sube evidencias; no ve quejas privadas salvo que sea participante explícito.
- **PADRE**: ve contenido del/los grupos de sus hijos; crea quejas privadas; puede escalar si no se resuelve.
- **ADMIN_TENANT** (opcional): similar a Director, orientado a TI.

### 5.2 Matriz de acciones clave (resumen)
| Acción | Director | Maestro Titular | Maestro Itinerante | Vocal | Padre |
|---|---:|---:|---:|---:|---:|
| Crear/editar grupos | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar/revocar vocal | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publicar aviso global | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publicar aviso por grupo | ✅ | ✅ | ✅* | ❌ | ❌ |
| Crear tarea | ✅ | ✅ | ✅* | ❌ | ❌ |
| Crear encuesta | ✅ | ✅ | ❌ | ✅ | ❌ |
| Votar encuesta | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear queja privada | ✅ (opcional) | ❌ | ❌ | ✅ (solo si permitido) | ✅ |
| Ver/gestionar quejas de grupo | ✅ | ✅ | ✅ (solo propias) | ❌ | ❌ |
| Escalar queja | ✅ | ✅ | ✅ (si involucrado) | ❌ | ✅ |
| Crear evento calendario | ✅ | ✅* | ✅* | ❌ | ❌ |
| Gestión recaudación/kermés | ✅ | ✅ (validación) | ❌ | ✅ (operación) | ❌ |
| Analítica | ✅ | (lectura limitada opcional) | ❌ | ❌ | ❌ |

\* Restringido a grupos donde el maestro tenga asignación.

---

## 6) Modelo de datos (Django ORM) — entidades

> Nota: En multi-tenant por subdominio, algunos modelos viven por tenant schema. En multi-tenant por columna, **todos** incluyen `school` como FK.

### 6.1 Núcleo de escuela y usuarios
- **School**: `id, name, slug, logo_url, subdomain, active`
- **SchoolYear**: `id, school, name, start_date, end_date, is_current`
- **User**: `id, school, first_name, last_name, email (único por escuela), phone, role, is_active`
- **Student**: `id, school, first_name, last_name, grade_level, enrollment_code`
- **ParentStudent**: `id, school, parent(User), student, relationship`
- **Group**: `id, school, school_year, name (5A), grade_level, homeroom_teacher(User maestro titular)`
- **GroupMembership**: `id, school, group, student`

### 6.2 Asignaciones maestros/vocales
- **SpecialistAssignment**: `id, school, group, teacher(User itinerante), subject`
- **VocalAssignment**: `id, school, group, parent(User), assigned_by(User titular), start_at, end_at, active`
  - Constraint: vocalía activa única por `(group, parent)`.

### 6.3 Comunicación estructurada
- **Announcement**: `id, school, scope(GLOBAL/GRUPO), group?, author(User), title, content, attachments[], created_at`
- **Homework**: `id, school, group, subject, teacher(User), title, description, due_date, attachments[], created_at`

### 6.4 Quejas privadas (privacidad + escalamiento)
- **Complaint**: `id, school, group, created_by(User padre), about_student?, target_teacher(User), status(OPEN/IN_REVIEW/ESCALATED/RESOLVED/CLOSED), visibility(PRIVATE), description, created_at, updated_at`
- **ComplaintParticipant**: `id, complaint, user, role_in_thread(CREATOR/TEACHER/DIRECTOR/OTHER_PARENT), added_by, added_at`
- **ComplaintMessage**: `id, complaint, author(User), message, attachments[], created_at`

### 6.5 Encuestas
- **Survey**: `id, school, created_by(User vocal/titular/director), scope(GRUPO/ESCUELA), group?, title, description, options[], is_anonymous, start_at, end_at, status`
- **SurveyVote**: `id, survey, voter(User), option, created_at`
  - Constraint: unique `(survey, voter)`.

### 6.6 Recaudaciones / kermés + evidencias
- **FundraisingEvent**: `id, school, school_year, name, date, description`
- **FundraisingGroupLedger**: `id, event, group, amount_collected, notes, created_by(User vocal), created_at`
- **ExpenseEvidence**: `id, ledger_entry? o group?, uploader(User vocal), file_url, amount, concept, created_at`

### 6.7 Auditoría
- **AuditLog**: `id, school, actor(User), action, entity_type, entity_id, metadata(JSON), created_at`

---

## 7) Reglas de negocio críticas

### 7.1 Quejas privadas
- Visibilidad solo para:
  - `created_by`,
  - `target_teacher`,
  - Director (modo auditor),
  - participantes añadidos explícitamente (`ComplaintParticipant`).
- Escalamiento automático:
  - Si una queja permanece en OPEN sin actividad o sin transición a IN_REVIEW/RESOLVED en **N días** configurable ⇒ cambiar a ESCALATED y notificar a Dirección (Celery).
- Trazabilidad:
  - Cada acción crítica genera `AuditLog` (crear/ver, cambio de estado, añadir participante, etc.).

### 7.2 Vocales
- Solo **Maestro Titular** o **Director** asignan/revocan `VocalAssignment`.
- Vocal puede operar:
  - encuestas de grupo,
  - recaudación de kermés/ledger,
  - evidencias de gastos.
- Vocal **no** puede ver quejas privadas salvo que sea participante.

### 7.3 Maestros itinerantes
- Pueden publicar avisos/tareas y crear eventos **solo** para grupos donde estén asignados en `SpecialistAssignment`.
- No pueden asignar vocales ni manejar recaudaciones.

### 7.4 Ciclos escolares
- `rollover_school_year` clona estructura de grupos y permite reasignaciones.
- Prevención de duplicados:
  - `Group` unique `(school, school_year, name)`.
- Conservación de histórico:
  - no se borra información del ciclo anterior.

---

## 8) API REST (DRF) — endpoints

> Todas las rutas bajo `/api/v1/`.  
> Autenticación: JWT (`/auth/login`, `/auth/refresh`).  
> Tenant: por subdominio o `X-School-ID`.  
> Paginación: DRF (`?page=&page_size=`).  
> Filtros/orden: query params estándar.

### 8.1 Auth & Perfil
- `POST /auth/login` → `{email, password}` → tokens
- `POST /auth/refresh`
- `GET /me` → perfil, rol, escuela, permisos/flags

### 8.2 Escuelas & Ciclos
- `GET /schools/current`
- `POST /school-years/rollover` (Director/Admin_Tenant)

### 8.3 Grupos & Asignaciones
- `GET /groups?school_year=current`
- `POST /groups` (Director)
- `POST /groups/{id}/assign-homeroom-teacher` (Director)
- `POST /groups/{id}/assign-specialist` (Director) `{subject, teacher_id}`
- `GET /groups/{id}/members` (autorizados)

### 8.4 Vocales
- `POST /groups/{id}/vocals` (Titular/Director) `{parent_user_id}`
- `DELETE /vocals/{assignment_id}` (Titular/Director)

### 8.5 Avisos & Tareas
- `POST /announcements` `{scope, group_id?, title, content, attachments[]}`
- `POST /homeworks` `{group_id, subject, due_date, attachments[]}`
- `GET /feed` (padre/maestro) mezcla paginada de tareas/avisos por sus grupos

### 8.6 Quejas privadas
- `POST /complaints`  
  `{group_id, target_teacher_id, about_student_id?, description}`
- `GET /complaints/{id}` (autorizados)
- `POST /complaints/{id}/messages` `{message, attachments[]}`
- `POST /complaints/{id}/participants` (maestro/director) `{user_id, role_in_thread}`
- `POST /complaints/{id}/status` `{status}`

### 8.7 Encuestas
- `POST /surveys`  
  `{scope, group_id?, title, description, options[], is_anonymous, start_at, end_at}`
- `POST /surveys/{id}/vote` `{option}` (1 voto/usuario)
- `GET /surveys/{id}/results` (agregados; sin identidad si es anónima)

### 8.8 Kermés / Recaudación
- `POST /fundraising-events` (Director)
- `POST /fundraising-ledger` (Vocal/Titular)  
  `{event_id, group_id, amount_collected, notes}`
- `POST /expense-evidences` `{ledger_id?, group_id?, amount, concept, file}`
- `GET /fundraising/events/{id}/summary` (Director/Titular) totales por grupo + evidencias

### 8.9 Analítica (Dirección)
- `GET /analytics/overview` (KPIs ciclo actual)
- `GET /analytics/complaints?group_id=&status=`
- `GET /analytics/fundraising?event_id=`
- `GET /analytics/engagement?group_id=`

---

## 9) Seguridad, privacidad y auditoría
- JWT + refresh; rotación segura (según configuración).
- RBAC en DRF + validaciones por pertenencia (grupo/escuela).
- Privacidad de quejas: permisos a nivel objeto (`ComplaintParticipant`).
- Rate limiting para endpoints sensibles (login, creación de quejas, etc.).
- Evidencias con URLs firmadas temporales.
- `AuditLog` obligatorio en operaciones críticas.

---

## 10) Jobs y notificaciones (Celery)

### 10.1 Jobs
- **Escalamiento de quejas**: diario
  - OPEN sin actividad por N días ⇒ ESCALATED + notificar Director.
- **Recordatorios de tareas**: (p.ej. diario) tareas con vencimiento mañana ⇒ notificar padres del grupo.
- **Encuestas por cerrar**: recordatorio a quienes no han votado.
- **Kermés**: resumen semanal a Dirección con totales/evidencias faltantes.
- **Recordatorios de eventos** (Calendario): 24h y 1h antes.

### 10.2 Canales
- Email (SMTP)
- Push (Expo Push)
- Interfaces (adaptadores) para SMS/WhatsApp en el futuro:
  - `NotificationProvider` con implementaciones `EmailProvider`, `PushProvider`, `SmsProvider`, `WhatsAppProvider`.

---

## 11) Web (Dirección) — UX clave (Next.js)
- Login y selector de ciclo escolar.
- Dashboard:
  - KPIs (quejas, recaudación, participación encuestas, eventos).
  - Gráficos: quejas por grupo/estado; recaudación por evento/grupo.
- Gestión:
  - grupos, maestros, vocales, ciclos.
- Quejas:
  - bandeja con filtros; timeline; acciones (cambiar estado, añadir participante, cerrar).
- Recaudación:
  - vista por evento; exportar CSV/PDF; evidencias.
- Encuestas:
  - creador; estado; resultados.
- Auditoría:
  - bitácora filtrable (`AuditLog`).

---

## 12) Móvil (Expo) — flujos

### 12.1 Maestro titular
- Publicar tarea/aviso
- Ver/atender quejas del grupo
- Asignar vocales
- Ver encuestas del grupo
- Crear eventos de grupo (según permisos)

### 12.2 Maestro itinerante
- Publicar tarea/aviso para grupos asignados
- Atender quejas relacionadas a su materia
- Crear eventos por grupo asignado (según permisos)

### 12.3 Vocal
- Crear encuestas
- Registrar recaudación
- Subir evidencias
- Ver resultados

### 12.4 Padre
- Feed tareas/avisos
- Votar encuestas
- Crear queja privada
- Mensajería dentro de la queja
- Ver calendario consolidado de grupos de sus hijos

---

## 13) Analítica — cálculos y KPIs
Ejemplos ORM/SQL:
- Quejas por grupo/estado
- Top padres por quejas creadas
- Recaudación por grupo y evento
- Participación: votos / usuarios elegibles por grupo

KPIs esperados en `analytics/overview`:
- `complaints_total`, `complaints_open`, `complaints_by_group[]`, `top_parents_by_complaints[]`
- `fundraising_total`, `fundraising_by_group[]`, `events_count`
- `surveys_count`, `participation_rate_by_group[]`
- `least_problematic_groups[]` (pocas quejas + alta participación)

---

## 14) Validaciones y casos límite
- Padre solo crea quejas para grupos donde tiene hijos (`ParentStudent` + `GroupMembership`).
- Itinerante solo publica en grupos de `SpecialistAssignment`.
- Encuestas: evitar voto duplicado; respetar ventana `start_at/end_at`.
- Vocal no puede autoasignarse; solo Titular/Director.
- Cambio de ciclo: evitar duplicados; migración asistida.
- Privacidad: eventos y evidencias fuera de alcance deben devolver 404 (no revelar existencia).

---

## 15) Seeds (fixtures)
Management command o fixtures para generar entorno demo:
- 1 escuela demo, 2 ciclos (actual + anterior)
- 4 grupos (3A, 3B, 5A, 5B)
- usuarios: 1 Director, 4 titulares, 3 itinerantes, ~20 alumnos/padres
- 2 vocales
- 1 kermés con ledger + evidencias
- 3 encuestas
- 10 tareas, 10 avisos
- 5 quejas con estados variados

---

## 16) Documentación y OpenAPI
- `drf-spectacular`:
  - `/api/schema`
  - `/api/docs`
- `README` con:
  - Docker Compose dev
  - `.env.example`
  - credenciales demo
  - guía despliegue prod (variables, dominios, storage S3, Redis/Celery)

---

## 17) Testing y calidad
- Backend: Pytest + coverage ≥ 80%
  - tests de permisos por rol
  - tests de visibilidad por escuela y por grupo
  - tests de quejas privadas (obj-permissions)
  - tests de escalamiento (job Celery)
- Web/Móvil: Jest + RTL
- Linters/formatters:
  - Python: ruff/black (si se decide)
  - TS: eslint + prettier

---

## 18) CI/CD (GitHub Actions)
Pipelines mínimos:
- Lint (backend + web + mobile)
- Tests (backend + web + mobile)
- Build (web + mobile)
- (Opcional) deploy a staging con tags o merges a `main`

---

## 19) Despliegue

### 19.1 Dev (docker-compose)
Servicios:
- postgres
- redis
- minio (S3 dev)
- backend
- web
- (Opcional) worker celery + beat

### 19.2 Producción
- reverse proxy (Nginx/Traefik) + HTTPS
- dominios por escuela (subdominios)
- storage S3
- observabilidad (Sentry, logs estructurados)

---

# ANEXO A — Calendario Escolar + Visibilidad por Grupo + Evidencias (Fotos)

## A.1 Reglas
- Creación:
  - Director: GLOBAL o por grupo(s)
  - Maestro titular / itinerante: eventos por grupo(s) donde tiene asignación
- Visibilidad:
  - GLOBAL: todos (Director, maestros, vocales, padres) de la escuela
  - GROUP: Director + maestros del grupo + vocales del grupo + padres con hijos en el grupo
- Padres multi-grupo: calendario consolidado de todos sus grupos
- Soporta solapamientos
- Recordatorios push/email (24h, 1h)
- Adjuntos y galería de fotos
- Edición/cancelación: autor o Director
- Export ICS (opcional)

## A.2 Modelos
- `Event` (scope GLOBAL/GROUP, start_at/end_at, status, created_by)
- `EventGroupAudience` (event, group) unique
- `EventAttachment` (file_url, mime_type, uploader)
- `EventPhoto` (photo_url, caption, uploader)
- `ActivityPhoto` (evidencia suelta, group/homework opcional)

## A.3 Endpoints
- `POST /events`
- `GET /events?from=&to=&group_id=&scope=`
- `GET /events/{id}`
- `PATCH /events/{id}` (autor/Director)
- `POST /events/{id}/cancel`
- `POST /events/{id}/attachments`
- `POST /events/{id}/photos`
- `GET /events/{id}/photos`
- `POST /activity-photos`
- `GET /groups/{id}/activity-photos`
- Job Celery: `events_send_reminders`

---

# ANEXO B — Chat Grupal Interno por Grupo

## B.1 Funcionalidad
- Chat por grupo (ej. 5A)
- Participantes:
  - padres con hijos en el grupo
  - maestro titular del grupo
  - vocal(es) del grupo
- Director: acceso **auditor** (lectura) para supervisión
- Distinción visual de roles dentro del chat (maestro/vocal)

## B.2 Modelos
- `GroupChat` (1:1 con Group, o generable)
- `ChatMessage` (chat, author, text, attachments?, created_at, message_type)
- Metadato de rol para render (derivado del usuario)

## B.3 Endpoints
- `POST /chats/{group_id}/messages`
- `GET /chats/{group_id}/messages` (+ `?audit=true` para director)
- Reglas: sólo miembros pueden escribir/leer; director sólo lectura.

---

## Apéndice — Pseudocódigo clave

### Lectura de queja privada
```python
def can_view_complaint(user, complaint):
    if user.role == DIRECTOR and user.school_id == complaint.school_id:
        return True
    if user.id in (complaint.created_by_id, complaint.target_teacher_id):
        return True
    return ComplaintParticipant.objects.filter(complaint=complaint, user=user).exists()
```

### Escalamiento automático (Celery)
```python
for c in Complaint.objects.filter(status='OPEN'):
    if now() - c.updated_at > settings.COMPLAINT_ESCALATION_DAYS:
        c.status = 'ESCALATED'
        c.save()
        notify_director(c)
```

### Publicación por itinerante
```python
def can_post_to_group(teacher, group):
    if teacher.role == MAESTRO_TITULAR and group.homeroom_teacher_id == teacher.id:
        return True
    if teacher.role == MAESTRO_ITINERANTE:
        return SpecialistAssignment.objects.filter(group=group, teacher=teacher).exists()
    return False
```

---

**Estado**: Documento base (v1). Cada cambio futuro debe reflejarse aquí y en la implementación (modelos, permisos, endpoints, UI y analítica).
