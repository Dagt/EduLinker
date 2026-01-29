# Prompt maestro para Codex: Completar EduLinker al 100 %

A continuación tienes un **prompt maestro listo para copiar/pegar** y usar con Codex. Está redactado para que realice todos los cambios necesarios y deje EduLinker completamente funcional, documentado, probado y listo para producción. Mantén la coherencia con la arquitectura multi‑tenant por escuela, Django/DRF en backend, Next.js para web de dirección y React Native/Expo para móvil.

---

## ✅ Prompt maestro (listo para usar)

**Rol**: Actúa como ingeniero principal y responsable de entrega. Ejecuta cambios en backend, frontend web y móvil, documentación, pruebas, seguridad y despliegue. No te limites a lo mínimo; completa lo necesario para que el producto sea completamente funcional.

### 1) Documentación técnica y de usuario
1. Crear nuevos archivos en `docs/`:
   - `users.md`: endpoints para listar/crear usuarios, actualizar roles/estado y restablecer contraseñas. Incluye ejemplos request/response y permisos por rol.
   - `students.md`: endpoints de creación/listado/actualización de alumnos, endpoint `PATCH /api/v1/students/{id}/groups/`, y asignación de padres. Incluye ejemplos y advertencias sobre múltiples grupos.
   - `groups.md`: creación de grupos, asignación de maestros titulares/especialistas, activación/desactivación de vocales y consulta de miembros.
   - `audit.md`: campos del `AuditLog`, filtros disponibles y ejemplos.
2. Actualizar `docs/README.md` con enlaces a los nuevos archivos.
3. Actualizar `docs/schema.md` con filtros y parámetros de paginación de los nuevos endpoints.
4. Actualizar OpenAPI `docs/schema.yaml` para incluir:
   - Paths de usuarios (`/api/v1/users/`, `/api/v1/users/{id}/role/`, `/api/v1/password-reset/`).
   - Paths de alumnos y grupos (`/api/v1/students/`, `/api/v1/students/{id}/groups/`, `/api/v1/parent-students/`).
   - Paths de auditoría y chat en tiempo real (`/api/v1/audit-logs/`, `ws/groups/{group_id}/chat/`).
   - Esquemas (serializers) para nuevos modelos.

### 2) Cobertura de pruebas
**Backend (pytest):**
- Tests para creación/listado de usuarios, alumnos y grupos.
- Tests para actualización de rol, cambio de contraseña, asignación de padres, maestros y vocales.
- Tests para filtros y paginación.
- Verificar registros de `AuditLog` en cada acción.
- Tests de permisos por rol y multi‑tenant estricto.

**Frontend web y móvil (Jest/RTL):**
- Pruebas de componentes y flujos para pantallas nuevas (usuarios, alumnos, grupos, auditoría).
- Validación de formularios y manejo de errores/notifications.

### 3) Internacionalización y accesibilidad
**i18n:**
- Usar archivos de traducción (`en.json`, `es.json`) en todas las vistas.
- Agregar claves faltantes para usuarios, alumnos, grupos y auditoría.
- Añadir selector de idioma en web y móvil.

**Accesibilidad:**
- Cumplir WCAG: roles, `aria-labels`, semántica HTML.
- Mejorar contraste de colores.
- Implementar modo oscuro consistente.

### 4) UI y flujos de trabajo
**Web (Next.js):**
- Pantallas para:
  - Listar/crear usuarios con filtros de rol y estado.
  - Editar rol/estado en modal.
  - Listar/crear alumnos y cambiar grupos.
  - Asignar/desasignar padres con formularios y validación.
  - Crear/listar grupos y asignar maestros y vocales.
  - Consultar log de auditoría con filtros.
  - Restablecer contraseñas con token.
- Indicadores de carga y mensajes de éxito/error en cada interacción.

**Móvil (Expo):**
- Vistas para que maestros/padres vean funciones nuevas.
- Mejorar experiencia de chat en tiempo real, mostrando estado de WebSocket.

### 5) Seguridad y cumplimiento
- Asegurar multi‑tenant estricto en cada endpoint y serializer.
- Tests para acceso con `school_id` incorrecto (esperar 403).
- Agregar políticas de privacidad y términos de uso en documentación e interfaz.
- Evitar datos sensibles en `AuditLog`.
- Implementar eliminación lógica o anonimización para usuarios desactivados.

### 6) Optimización y performance
- Agregar índices en campos usados en filtros (`school_id`, `created_at`, `role`, `status`).
- Optimizar consultas con `select_related` y `prefetch_related`.
- Configurar `CHANNEL_LAYERS` con Redis para producción y documentarlo.
- Añadir límites de tasa (throttling) para chat/notificaciones.

### 7) Despliegue y mantenimiento
- Scripts para migraciones y rollover de ciclo escolar.
- Documentar configuración multi‑tenant (subdominios) y HTTPS.
- Ajustar CI/CD para backend, web y móvil, incluyendo nuevas dependencias.
- Generar artefactos de build para móvil (APK/IPA) listos para stores.

### 8) Integración de módulos existentes
- Completar integración de sugerencias, encuestas y recaudaciones en web y móvil.
- Verificar permisos, filtros, paginación y consistencia con módulos nuevos.
- Completar panel de analítica con gráficas y comparativas por ciclo escolar.

### 9) Checklist final de entrega
- Ejecutar `pytest`, `next build` y builds móviles.
- Revisar documentación y OpenAPI para consistencia.
- Preparar versión RC, tags, CHANGELOG y notas de lanzamiento.

---

### Criterios de éxito
- **Todas las pruebas pasan** (backend, web, móvil).
- **Documentación completa** y OpenAPI alineado con el código.
- **Interfaz funcional** con flujos completos y validaciones.
- **Seguridad multi‑tenant comprobada**.
- **Listo para producción** con CI/CD actualizado.

