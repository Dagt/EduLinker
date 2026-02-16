# Invitations API

Permite onboarding sin fricción con códigos/enlaces por escuela.

## Endpoints

- `POST /api/v1/invitations/` (DIRECTOR, ADMIN_TENANT): crea invitación.
- `GET /api/v1/invitations/` (DIRECTOR, ADMIN_TENANT): lista y filtra por `role`, `group`, `state` (`active|expired|revoked`).
- `POST /api/v1/invitations/{token}/revoke/` (DIRECTOR, ADMIN_TENANT): revoca invitación.
- `POST /api/v1/invitations/{token}/accept/` (auth opcional): acepta invitación.

## Reglas

- Tenant se resuelve por token y se rechaza cuando `X-SCHOOL-ID` contradice.
- Invitaciones revocadas, expiradas o sin usos disponibles devuelven `400`.
- Al aceptar se incrementa `uses_count`.
- Acciones auditadas: `invitation_create`, `invitation_revoke`, `invitation_accept`.

## Asociaciones automáticas

- `PADRE`: usa `metadata.enrollment_code` para vincular `ParentStudent`.
- `VOCAL`: crea `VocalAssignment`.
- `MAESTRO_ITINERANTE`: crea `SpecialistAssignment` (usa `metadata.subject` o `General`).
- `MAESTRO_TITULAR`: asigna `homeroom_teacher` si el grupo está libre.
