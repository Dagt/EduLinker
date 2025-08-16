# Guía de despliegue

## Docker

1. Copia `backend/.env.example` a `backend/.env` y ajusta las variables.
2. Copia `web/env.example` a `web/.env` y define `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SCHOOL_ID`.
3. Copia `mobile/env.example` a `mobile/.env` y define `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_SCHOOL_ID`.
4. Ejecuta:

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
cp env.example .env
npm install
npm run dev
```

### Mobile
```bash
cd mobile
cp env.example .env
npm install
npx expo start
```
