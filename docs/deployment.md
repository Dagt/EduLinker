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

    # JWT
    JWT_SECRET_KEY=change-me
    JWT_ALGORITHM=HS256

    # Sentry
    SENTRY_DSN=
    SENTRY_ENVIRONMENT=production
    ```

3. Ejecuta la pila completa:

   ```bash
    docker compose up --build
    ```

4. Aplica migraciones y (opcionalmente) carga datos de ejemplo:

    ```bash
    docker compose exec api python manage.py migrate
    docker compose exec api python manage.py seed_demo
    ```

5. El backend estará en `http://localhost:8000`, el front web en `http://localhost:3000`
   y la consola de MinIO en `http://localhost:9001`.

6. Para servir en producción, coloca un proxy inverso (Nginx/Traefik) delante de
   `api` y `web`, configura los dominios en `ALLOWED_HOSTS`, `NEXT_PUBLIC_API_URL`
   y `EXPO_PUBLIC_DOMAIN`, y genera certificados HTTPS (por ejemplo con Let's Encrypt).

## Kubernetes

1. Construye y publica las imágenes en tu registry:

    ```bash
    docker build -t registry.example.com/edulinker-api backend
    docker build -t registry.example.com/edulinker-web web
    docker push registry.example.com/edulinker-api
    docker push registry.example.com/edulinker-web
    ```

2. Crea los secrets/configmaps con las variables de entorno:

    ```bash
    kubectl create secret generic edulinker-api-env --from-env-file=backend/.env
    kubectl create configmap edulinker-web-env --from-env-file=web/.env
    ```

3. Aplica los manifiestos (`Deployment`, `Service` e `Ingress`):

    ```bash
    kubectl apply -f k8s/
    ```

4. Ejecuta las migraciones y semillas:

    ```bash
    kubectl exec deploy/edulinker-api -- python manage.py migrate
    kubectl exec deploy/edulinker-api -- python manage.py seed_demo
    ```

5. Configura HTTPS mediante el `Ingress` (p. ej. usando `cert-manager`) y
   apunta tus dominios a la IP del balanceador.

## Manual

### Backend
```bash
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py seed_demo
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

La acción `ci.yml` se ejecuta en cada `push` y `pull_request` para validar los tres módulos principales:

- **Backend**: corre `flake8`, construye con `python setup.py install` y ejecuta `pytest`.
- **Web**: instala con `npm ci`, pasa `npm run lint`, corre `npm test` y genera `npm run build`.
- **Mobile**: instala con `npm ci`, pasa `npm run lint`, corre `npm test` y genera `npm run build`.

Los resultados y artefactos de cada job pueden consultarse en la pestaña *Actions* de GitHub.
