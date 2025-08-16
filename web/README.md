# Frontend web

## Requisitos

- Node.js 20
- npm

## Variables de entorno

Copia `env.example` a `.env` y ajusta los valores según tu entorno:

```bash
cp env.example .env
```

- `NEXT_PUBLIC_API_URL`: URL base de la API. En desarrollo suele ser `http://localhost:8000/api/v1`.
- `NEXT_PUBLIC_SCHOOL_ID`: identificador de la escuela. Su valor se envía en todas las solicitudes HTTP mediante el encabezado `X-School-ID`.

Las peticiones del frontend agregan automáticamente el encabezado `X-School-ID` con el identificador configurado para que el backend pueda resolver la escuela correspondiente.

## Comandos de npm

- `npm install`: instala las dependencias.
- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la aplicación optimizada para producción.
- `npm start`: ejecuta la build generada.
- `npm test`: ejecuta la suite de pruebas.
- `npm run lint`: verifica el estilo del código.

