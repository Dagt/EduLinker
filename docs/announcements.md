# Anuncios

## Endpoints

- `GET /api/v1/announcements/` – Lista anuncios con paginación.
- `POST /api/v1/announcements/` – Crea un anuncio (directores y maestros titulares según alcance).
- `GET /api/v1/announcements/{id}/` – Obtiene el detalle de un anuncio.
- `PUT /api/v1/announcements/{id}/` – Actualiza un anuncio existente.
- `DELETE /api/v1/announcements/{id}/` – Elimina un anuncio.

## Ejemplo de solicitud

```json
POST /api/v1/announcements/
{
  "title": "Recordatorio",
  "message": "Mañana hay reunión",
  "scope": "GROUP",
  "group": 12
}
```

## Ejemplo de respuesta

```json
{
  "id": 45,
  "title": "Recordatorio",
  "message": "Mañana hay reunión",
  "scope": "GROUP",
  "group": 12,
  "created_at": "2024-05-01T18:00:00Z"
}
```
