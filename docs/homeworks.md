# Tareas

## Endpoints

- `GET /api/v1/homeworks/` – Lista tareas con paginación.
- `POST /api/v1/homeworks/` – Crea una tarea para un grupo.
- `GET /api/v1/homeworks/{id}/` – Obtiene detalle de una tarea.
- `PUT /api/v1/homeworks/{id}/` – Actualiza una tarea existente.
- `DELETE /api/v1/homeworks/{id}/` – Elimina una tarea.

## Ejemplo de solicitud

```json
POST /api/v1/homeworks/
{
  "group": 12,
  "title": "Lectura semanal",
  "description": "Leer capítulo 3",
  "due_date": "2024-05-10"
}
```

## Ejemplo de respuesta

```json
{
  "id": 88,
  "group": 12,
  "title": "Lectura semanal",
  "description": "Leer capítulo 3",
  "due_date": "2024-05-10",
  "created_at": "2024-05-01T18:00:00Z"
}
```
