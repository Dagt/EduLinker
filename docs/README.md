# Documentación

Guías y referencias para los distintos módulos de EduLinker.

- [Analytics Overview](analytics.md)
- [Chat API](chat.md)
- [Complaints API](complaints.md)
- [Deployment](deployment.md)
- [Events API](events.md)
- [Fundraising API](fundraising.md)
- [Gestión de grupos](groups.md)
- [Gestión de alumnos](students.md)
- [Gestión de usuarios](users.md)
- [Relaciones padre-alumno](parent_students.md)
- [Logs de auditoría](audit_logs.md)
- [Notifications API](notifications.md)
- [Permissions Overview](permissions.md)
- [Password reset](reset_password.md)
- [Seeds de datos](seeds.md)
- [Multi-tenant](multi_tenant.md)
- [Security](security.md)
- [Suggestions API](suggestions.md)
- [Surveys API](surveys.md)
- [Casos de uso](use_cases.md)
- [OpenAPI schema](../backend/docs/openapi.json) (generado con `python backend/manage.py spectacular --file backend/docs/openapi.json`)

## Perfil y calendario

El endpoint `/api/v1/me/` devuelve los datos del usuario autenticado, incluyendo
el `ics_token`, el idioma preferido y el enlace de suscripción al calendario con
el parámetro `school_id`. Usa este endpoint para mostrar el token en la interfaz
de perfil y para actualizar nombre e idioma vía `PUT /api/v1/me/`.

Nuevos endpoints relacionados:

- `POST /api/v1/me/regenerate-ics/`: regenera el token de calendario del usuario autenticado.
- `POST /api/v1/auth/change-password/`: cambia la contraseña validando la actual.
