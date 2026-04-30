# Financial Tracker

## Deploying to Railway

This repo is ready to deploy as a single Railway service. Railway will use the `Dockerfile` to build the React frontend, collect Django static files, run migrations, and start Gunicorn.

In Railway, set the service root directory to:

```text
financial_planner
```

Set these Railway variables:

```text
SECRET_KEY=your-production-django-secret
DEBUG=False
```

Attach a Railway Postgres database to the service. Railway provides `DATABASE_URL` automatically, and Django will use it in production. If you add a custom domain, add it to:

```text
ALLOWED_HOSTS=your-domain.com,.up.railway.app
CSRF_TRUSTED_ORIGINS=https://your-domain.com
```

For local development, keep using SQLite and the Vite dev server. The frontend proxies `/api` requests to Django on port `8000`.
