# Guía de despliegue

## Docker

1. Copia `backend/.env.example` a `backend/.env` y ajusta las variables.
2. Copia `web/.env.example` a `web/.env`.
3. Ejecuta:

```bash
docker compose up --build
```

El backend estará en `http://localhost:8000` y el front web en `http://localhost:3000`.

## Manual

### Backend
```bash
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver
```

### Web
```bash
cd web
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```
