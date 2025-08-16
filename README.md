# EduLinker

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

Revisa la carpeta `docs/` para guías de despliegue, seeds y casos de uso.
