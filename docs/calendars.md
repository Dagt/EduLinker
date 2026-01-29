# Suscripción a calendarios (iCalendar)

Cada usuario cuenta con un `ics_token` único para suscribirse a los eventos.

## URL de suscripción

```
https://<dominio>/api/v1/events/ics/?token=<ics_token>&school_id=<school_id>
```

## Regenerar token

Si necesitas invalidar un enlace previo:

- `POST /api/v1/me/regenerate-ics/`

La respuesta devuelve el nuevo `ics_token` y `calendar_subscription_url`.

## Google Calendar

1. Copia la URL de suscripción.
2. En Google Calendar, selecciona **Otros calendarios** → **Desde URL**.
3. Pega la URL y guarda.

## Outlook

1. Copia la URL de suscripción.
2. En Outlook, selecciona **Agregar calendario** → **Suscribirse desde web**.
3. Pega la URL y guarda.
