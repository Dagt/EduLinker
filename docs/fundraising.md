# Fundraising API

Registra eventos de recaudación y los ingresos o gastos de cada grupo.

## Roles permitidos

- **DIRECTOR**: crea, actualiza y elimina eventos; puede registrar ingresos.
- **MAESTRO_TITULAR**: puede registrar ingresos para su grupo.
- **VOCAL**: puede registrar ingresos y subir comprobantes de gastos.
- Todos los usuarios autenticados pueden consultar resúmenes de eventos.

## Endpoints

### Eventos
- `GET /api/v1/fundraising-events/` – Lista eventos (solo DIRECTOR).
- `POST /api/v1/fundraising-events/` – Crea un evento (solo DIRECTOR).
- `GET /api/v1/fundraising-events/{id}/` – Detalle del evento; los directores pueden eliminarlo.
- `PATCH /api/v1/fundraising-events/{id}/update/` – Actualiza datos del evento (DIRECTOR).
- `DELETE /api/v1/fundraising-events/{id}/` – Elimina un evento (DIRECTOR).
- `GET /api/v1/fundraising-events/{id}/summary/` – Resumen de montos recaudados y gastos.

### Registros de grupos
- `GET /api/v1/fundraising-ledger/` – Lista registros accesibles al usuario.
- `POST /api/v1/fundraising-ledger/` – Registra ingreso para un grupo.
- `GET /api/v1/fundraising-ledger/{id}/` – Detalle de un registro.
- `PATCH /api/v1/fundraising-ledger/{id}/` – Actualiza un registro existente.
- `DELETE /api/v1/fundraising-ledger/{id}/` – Elimina un registro.

### Evidencias de gasto
- `GET /api/v1/expense-evidences/` – Lista evidencias disponibles.
- `POST /api/v1/expense-evidences/` – Sube un comprobante (solo VOCAL asignado).
- `GET /api/v1/expense-evidences/{id}/` – Detalle de un comprobante.
- `PATCH /api/v1/expense-evidences/{id}/` – Actualiza un comprobante.
- `DELETE /api/v1/expense-evidences/{id}/` – Elimina un comprobante.

## Ejemplos

### Registrar ingreso en el libro de un grupo

```bash
curl -X POST https://api.edulinker.test/api/v1/fundraising-ledger/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-SCHOOL-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{ "event": 2, "group": 5, "amount_collected": "150.00" }'
```

**Respuesta**

`201 Created` – ingreso registrado.  
`403 Forbidden` – si el rol no puede operar sobre el grupo.  
`400 Bad Request` – datos inválidos.

### Consultar resumen de un evento

```js
fetch('/api/v1/fundraising-events/2/summary/', {
  headers: { 'Authorization': 'Bearer TOKEN', 'X-SCHOOL-ID': '1' }
}).then(r => r.json());
```

**Respuesta**

`200 OK` – detalles del evento con totales y gastos.  
`404 Not Found` – si el evento no existe o pertenece a otra escuela.

