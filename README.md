# EduLinker

[![CI](https://github.com/EduLinker/EduLinker/actions/workflows/test.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/test.yml)
[![Backend CI](https://github.com/EduLinker/EduLinker/actions/workflows/backend.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/backend.yml)
[![Web CI](https://github.com/EduLinker/EduLinker/actions/workflows/web.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/web.yml)
[![Mobile CI](https://github.com/EduLinker/EduLinker/actions/workflows/mobile.yml/badge.svg)](https://github.com/EduLinker/EduLinker/actions/workflows/mobile.yml)

Repositorio monorepo con:

- `backend/` - API Django REST
- `web/` - Frontend Next.js
- `mobile/` - App móvil Expo

## Puesta en marcha rápida

1. Copia `*.env.example` a `.env` en las carpetas necesarias.
2. Backend:
   ```bash
   pip install -r backend/requirements.txt
   python backend/manage.py migrate
   # Datos de demostración
   python backend/manage.py loaddata_demo
   python backend/manage.py runserver
   ```
3. Web:
   ```bash
   cd web
   npm install
   npm run dev
   ```
4. Mobile:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```


## Documentación API

La especificación OpenAPI se puede obtener en `/api/schema` y una interfaz interactiva en `/api/docs`. También se incluye una copia en `docs/openapi.json`.

Revisa la carpeta `docs/` para guías de despliegue, seeds y casos de uso.
