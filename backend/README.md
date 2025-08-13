# EduLinker Backend

## Setup

### Windows (venv)

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

### Docker

1. Create a `.env` file from `.env.example`.
2. Build and run using Docker Compose:

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000/`.

### Environment Variables

The `.env` file accepts:

- `DEBUG`
- `SECRET_KEY`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `CORS_ALLOWED_ORIGINS`

### Demo Data

Populate the database with sample objects:

```bash
python manage.py seed_demo
```

## Authentication

Use JWT endpoints:
- `POST /api/v1/auth/login/` with username and password.
- `POST /api/v1/auth/refresh/` with refresh token.

All requests must include the `X-School-ID` header.
