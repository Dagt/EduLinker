# Documentación

Guías y referencias para los distintos módulos de EduLinker.

- [Analytics Overview](analytics.md)
- [Chat API](chat.md)
- [Complaints API](complaints.md)
- [Deployment](deployment.md)
- [Events API](events.md)
- [Fundraising API](fundraising.md)
- [Notifications API](notifications.md)
- [Permissions Overview](permissions.md)
- [Seeds de datos](seeds.md)
- [Suggestions API](suggestions.md)
- [Surveys API](surveys.md)
- [Casos de uso](use_cases.md)
- [OpenAPI schema](../backend/docs/openapi.json) (generado con `python backend/manage.py spectacular --file backend/docs/openapi.json`)

## Perfil y calendario

El endpoint `/api/v1/me/` devuelve los datos del usuario autenticado, incluyendo
el `ics_token` y el enlace de suscripción al calendario con el parámetro
`school_id`. Usa este endpoint para mostrar el token en la interfaz de perfil.
