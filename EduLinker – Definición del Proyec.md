# EduLinker – Definición del Proyecto

## 1. Descripción General
EduLinker es un sistema de gestión escolar **multi-tenant** (una instancia por escuela) diseñado para mejorar la comunicación, organización y control administrativo entre **dirección, maestros, vocales y padres de familia**.  
Integra un backend robusto con **Django + DRF + PostgreSQL + Redis + Celery**, un panel web administrativo en **Next.js** y una app móvil en **React Native/Expo** para los demás roles.

---

## 2. Objetivos
- Facilitar la comunicación estructurada entre los diferentes roles.
- Organizar tareas, avisos, eventos y actividades escolares de forma centralizada.
- Gestionar quejas privadas con escalamiento y seguimiento.
- Controlar recaudaciones escolares con evidencias y transparencia.
- Proporcionar un calendario global y por grupo.
- Ofrecer analítica a la dirección para la toma de decisiones.

---

## 3. Arquitectura

### 3.1 Backend
- **Framework:** Django + Django REST Framework
- **Base de datos:** PostgreSQL
- **Cache & colas:** Redis
- **Tareas asíncronas:** Celery
- **Autenticación:** JWT con control de roles y permisos.
- **Multi-tenancy:** Separación lógica por escuela.

### 3.2 Frontend Web
- **Framework:** Next.js (React)
- **Usuarios objetivo:** Dirección
- **Funcionalidad principal:** Panel de control, analítica, gestión de usuarios, eventos, quejas, recaudaciones.

### 3.3 App Móvil
- **Framework:** React Native / Expo
- **Usuarios objetivo:** Maestros, vocales y padres de familia
- **Funcionalidad principal:** Avisos, tareas, encuestas, eventos, quejas y evidencias.

### 3.4 Infraestructura
- **Contenedores:** Docker
- **Orquestación:** Kubernetes (K8s)
- **CI/CD:** GitHub Actions
- **Despliegue:** Producción y staging separados.

---

## 4. Módulos Principales

### 4.1 Gestión de Grupos y Ciclos Escolares
- Crear, editar y archivar grupos por ciclo escolar.
- Asignar maestros titulares y vocales.
- Permitir padres con hijos en varios grupos.

### 4.2 Comunicación Estructurada
- **Avisos:** Globales o por grupo.
- **Tareas:** Con fecha de entrega, visibles por grupo.
- **Encuestas:** Preguntas con opción múltiple, votos únicos.
- **Chat:** Por grupo, con roles autorizados.
- **Evidencias:** Fotos y archivos de actividades.

### 4.3 Quejas Privadas con Escalamiento
- Creación por parte de padres o vocales.
- Escalamiento automático si no hay respuesta.
- Seguimiento por estado (abierta, en proceso, cerrada).

### 4.4 Gestión de Recaudaciones
- Registro de eventos de recaudación (kermés, rifas, etc.).
- Control de ingresos y gastos por grupo y global.
- Subida de evidencias de gastos.
- Transparencia total para la comunidad escolar.

### 4.5 Calendario Escolar
- Eventos globales: visibles para toda la escuela.
- Eventos por grupo: visibles solo para padres y maestros del grupo.
- Roles que pueden crear eventos: Director y maestros titulares.
- Soporte para padres con hijos en múltiples grupos.

### 4.6 Analítica y Reportes
- Estadísticas de participación en encuestas.
- Estado y tiempo de resolución de quejas.
- Avance y resultado de recaudaciones.
- Actividad por rol y grupo.

---

## 5. Roles y Permisos

| Funcionalidad              | Director | Maestro Titular | Vocal | Padre |
|----------------------------|----------|-----------------|-------|-------|
| Crear/editar grupos        | ✔        | ✘               | ✘     | ✘     |
| Publicar avisos globales   | ✔        | ✘               | ✘     | ✘     |
| Publicar avisos por grupo  | ✔        | ✔               | ✘     | ✘     |
| Crear tareas               | ✔        | ✔               | ✘     | ✘     |
| Crear encuestas            | ✔        | ✔               | ✔     | ✘     |
| Votar encuestas            | ✔        | ✔               | ✔     | ✔     |
| Crear quejas               | ✔        | ✘               | ✔     | ✔     |
| Gestionar recaudaciones    | ✔        | ✔               | ✔     | ✘     |
| Crear eventos calendario   | ✔        | ✔               | ✘     | ✘     |
| Subir evidencias           | ✔        | ✔               | ✔     | ✘     |

---

## 6. Analítica y Métricas
- **Eventos:** cantidad global y por grupo.
- **Quejas:** tiempo promedio de resolución.
- **Recaudaciones:** ingresos, gastos y saldo final.
- **Participación:** en encuestas y actividades.

---

## 7. Seguridad
- Autenticación y autorización estricta por rol.
- Cifrado de contraseñas y datos sensibles.
- Control de acceso por tenant (escuela).
- Logs de auditoría para cambios críticos.

---

## 8. Despliegue y Mantenimiento
- **Entorno local:** Docker Compose.
- **Staging:** Kubernetes + base de datos aislada.
- **Producción:** Kubernetes en nube (AWS/GCP/Azure).
- **CI/CD:** Deploy automático tras aprobar PR en rama `dev` → `main`.
- **Monitoreo:** Prometheus + Grafana.

---

## 9. Consideraciones Especiales
- Padres pueden tener hijos en varios grupos.
- Una misma persona puede ser vocal en varios grupos.
- Eventos y evidencias filtrados por grupo o globalmente.
- Multi-idioma opcional en interfaz.

---
