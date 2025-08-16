# Guía de despliegue

## Docker Compose

1. Copia los ejemplos de variables de entorno a cada módulo:

   ```bash
   cp docs/backend.env.example backend/.env
   cp docs/web.env.example web/.env
   cp docs/mobile.env.example mobile/.env
   ```

2. El archivo `docker-compose.yml` levanta PostgreSQL, Redis y MinIO (S3).
   El backend usa las siguientes variables para conectarse a estos servicios:

   ```bash
   # Redis
   REDIS_URL=redis://redis:6379/0

   # S3/MinIO
   AWS_ACCESS_KEY_ID=minio
   AWS_SECRET_ACCESS_KEY=minio123
   AWS_STORAGE_BUCKET_NAME=edulinker
   S3_ENDPOINT_URL=http://minio:9000
   S3_PUBLIC_URL_PREFIX=http://localhost:9000/edulinker
   AWS_REGION=us-east-1
   ```

3. Ejecuta la pila completa:

   ```bash
   docker compose up --build
   ```

El backend estará en `http://localhost:8000`, el front web en `http://localhost:3000`
y la consola de MinIO en `http://localhost:9001`.

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

## Integración continua

Este repositorio incluye pipelines de GitHub Actions para verificar el código automáticamente:

- **Backend CI** ejecuta `flake8` y `pytest` con reporte de cobertura.
- **Web CI** corre `npm test` y `npm run build` para la aplicación web.
- **Mobile CI** corre `npm test` y `npm run build` para la aplicación móvil.

Cada flujo publica los reportes de cobertura y los artefactos de compilación en la pestaña *Actions* de GitHub, donde pueden descargarse para revisión.
