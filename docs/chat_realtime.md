# Chat en tiempo real

## WebSocket

`ws/groups/<group_id>/chat/`

### Autenticación

Envía el token JWT en la query string:

```
ws://api.example.com/ws/groups/12/chat/?token=<JWT>
```

Si estás en HTTPS usa `wss://`.

### Mensajes

El consumidor de Django Channels acepta el payload definido por el backend
(`message_text`, `attachment_url`) y transmite mensajes a los miembros del grupo.
