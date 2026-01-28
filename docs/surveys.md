# Surveys API

Gestión de encuestas para grupos o toda la escuela.

## Roles permitidos

- **DIRECTOR**: puede crear encuestas globales o de grupo y ver resultados.
- **MAESTRO_TITULAR**: puede crear encuestas para su grupo y ver resultados.
- **MAESTRO_ITINERANTE**: puede ver resultados de encuestas de grupos asignados.
- **VOCAL**: puede crear encuestas para su grupo y ver resultados.
- **PADRE**: puede votar en encuestas activas de su grupo.

## Endpoints

- `GET /api/v1/surveys/` – Lista encuestas disponibles.
- `POST /api/v1/surveys/` – Crea una encuesta.
- `GET /api/v1/surveys/{id}/` – Detalle de la encuesta.
- `POST /api/v1/surveys/{id}/vote/` – Registra el voto.
- `GET /api/v1/surveys/{id}/results/` – Resultados agregados.

## Ejemplos

### Crear encuesta

```bash
curl -X POST https://api.edulinker.test/api/v1/surveys/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "GROUP",
    "group": 5,
    "title": "¿Qué día prefieren?",
    "description": "Elija la mejor opción",
    "options": ["Lunes", "Miércoles", "Viernes"],
    "is_anonymous": false,
    "start_at": "2024-05-01T08:00:00Z",
    "end_at": "2024-05-07T23:59:00Z"
  }'
```

**Respuesta**

`201 Created` – encuesta creada.  
`403 Forbidden` – si el rol no tiene permisos sobre el grupo.

### Votar encuesta

```bash
curl -X POST https://api.edulinker.test/api/v1/surveys/15/vote/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "option_index": 2 }'
```

**Respuesta**

`201 Created` – voto registrado.  
`400 Bad Request` – si el índice es inválido o el usuario ya votó.  
`403 Forbidden` – si la encuesta no está activa.

### Consultar resultados

```js
fetch('/api/v1/surveys/15/results/', {
  headers: { 'Authorization': 'Bearer TOKEN', 'X-SCHOOL-ID': '1' }
}).then(r => r.json());
```

**Respuesta**

`200 OK` – resultados agregados por opción.
