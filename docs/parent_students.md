# Parent-Student Relationships

Endpoints para administrar vínculos padre–alumno dentro de la misma escuela.

## Endpoints

- `GET /api/v1/parent-students/`
  - Lista relaciones padre–alumno.
  - Requiere rol Director o Admin Tenant.
- `POST /api/v1/parent-students/`
  - Crea relación padre–alumno con campos `parent`, `student`, `relationship`.
  - Valida que padre y alumno pertenezcan a la misma escuela.
- `DELETE /api/v1/parent-students/{id}/`
  - Desvincula la relación.
  - Registra AuditLog con `action=unassign_parent`.

## Seguridad y multi-tenant

Todas las consultas filtran por `school_id` del request. Intentos de mezclar
padres/alumnos de otra escuela retornan `403`.
