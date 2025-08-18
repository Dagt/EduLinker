# EduLinker

[![CI](https://github.com/EduLinker/EduLinker/actions/workflows/test.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/test.yml)
[![Backend CI](https://github.com/EduLinker/EduLinker/actions/workflows/backend.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/backend.yml)
[![Web CI](https://github.com/EduLinker/EduLinker/actions/workflows/web.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/web.yml)
[![Mobile CI](https://github.com/EduLinker/EduLinker/actions/workflows/mobile.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/mobile.yml)

Plataforma abierta para la comunicación y gestión escolar. Incluye API en
Django, panel web en Next.js y aplicación móvil en Expo, todo preparado para
funcionar por múltiples escuelas (multi‑tenant).

## Contenido del repositorio

- `backend/` – API REST con Django.
- `web/` – panel web para Dirección.
- `mobile/` – aplicación móvil para maestros, vocales y familias.
- `docs/` – guías de despliegue, casos de uso y referencias.

## Requisitos

Para la instalación más sencilla se utiliza **Docker** y **Docker Compose**. Si
prefieres instalación manual necesitarás:

- Python 3.11
- Node.js 20 y npm
- PostgreSQL, Redis y un almacenamiento S3 compatible (se incluye MinIO para
  desarrollo)

## Inicio rápido (Docker Compose)

1. Clona el repositorio y entra en la carpeta:

   ```bash
   git clone https://github.com/EduLinker/EduLinker.git
   cd EduLinker
   ```

2. Copia los ejemplos de variables de entorno:

   ```bash
   cp docs/backend.env.example backend/.env
   cp docs/web.env.example web/.env
   cp docs/mobile.env.example mobile/.env
   ```

3. Arranca todos los servicios (PostgreSQL, Redis, MinIO, API y web):

   ```bash
   docker compose up --build
   ```

4. En otra terminal aplica migraciones y carga datos de demostración:

   ```bash
   docker compose exec api python manage.py migrate
   docker compose exec api python manage.py seed_demo
   ```

5. Abre tu navegador en `http://localhost:3000` para el panel web. La API está
   disponible en `http://localhost:8000`.

## Acceso de prueba

Los datos de demostración crean usuarios con las siguientes credenciales
(contraseña para todos: `demo123`):

- Director: `director@demo.com`
- Maestros titulares: `5A@demo.com`, `5B@demo.com`, `3A@demo.com`,
  `3B@demo.com`
- Maestros itinerantes: `ingles@demo.com`, `computación@demo.com`,
  `ef@demo.com`
- Padres: `<codigo_de_inscripción>@familia.com`

Ingresa con el rol deseado para explorar las distintas vistas.

## Instalación manual

### Backend

```bash
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # ajusta valores si es necesario
python backend/manage.py migrate
python backend/manage.py seed_demo     # opcional
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

La aplicación móvil se abre en el emulador o mediante la app Expo Go.

## Pruebas automáticas

Cada módulo incluye una suite de pruebas. Puedes ejecutarlas con:

```bash
pytest backend
npm test --prefix web
npm test --prefix mobile
```

## Estructura de carpetas

```
EduLinker/
├── backend/   # API Django REST
├── web/       # Frontend Next.js
├── mobile/    # App móvil Expo
├── docs/      # Documentación adicional
└── docker-compose.yml
```

## Más documentación

- La especificación de la API está en `http://localhost:8000/api/docs` y en
  `docs/openapi.json`.
- La carpeta `docs/` contiene guías de despliegue, detalles de permisos y casos
  de uso.

---

¡Listo! Con estos pasos puedes probar EduLinker en tu equipo y explorar sus
funcionalidades principales.

