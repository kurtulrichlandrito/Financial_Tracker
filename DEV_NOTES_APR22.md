# Financial Planner — Dev Notes
**Date:** April 22, 2026

---

## Environment Setup

Created a virtual environment to isolate project dependencies:

```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

Installed core backend packages:

```bash
pip install django djangorestframework
```

---

## Project Initialization

```bash
django-admin startproject financial_planner
cd financial_planner
django-admin startapp api
django-admin startapp frontend
```

Registered both apps in `settings.py`:

```python
INSTALLED_APPS = [
    ...
    'api',
    'frontend',
    'rest_framework',
]
```

---

## Database Setup

### Attempted: PostgreSQL on Railway
Tried connecting to a cloud-hosted PostgreSQL database on Railway using the guide:
https://dev.to/dennisivy11/easiest-django-postgres-connection-ever-with-railway-11h6

This approach uses `django-environ` to load credentials from a `.env` file:

```bash
pip install django-environ
```

```python
import environ

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')
```

The `.env` file would contain:
```
DB_NAME=myapp
DB_USER=myuser
DB_PASSWORD=yourpassword
DB_HOST=shinkansen.proxy.rlwy.net
DB_PORT=13528
```

And `settings.py` DATABASES would be:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env.str("DB_NAME", "myapp"),
        'USER': env.str("DB_USER", "myuser"),
        'PASSWORD': env.str("DB_PASSWORD"),
        'HOST': env.str("DB_HOST", "shinkansen.proxy.rlwy.net"),
        'PORT': env.str("DB_PORT", "13528"),
    }
}
```

### Decision: Reverted to SQLite
Using a hosted database during development is bad practice — it adds latency and risks corrupting shared data. SQLite is the Django default and is ideal for local development.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

---

## Backend — API App

### Models
Defined database models in `api/models.py`. Models in Django are similar to SQL table definitions — each class is a table and each field is a column.

After defining models, run migrations to apply them to the database:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Serializers
Created serializers in `api/serializers.py`. Serializers act as a translator between Django model objects (Python) and JSON (for the frontend).

- **Inbound (POST):** Validates incoming JSON and converts it to a DB object
- **Outbound (GET):** Converts DB objects to JSON for the response

```python
from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'name', 'amount', 'category']
```

### Views
Created views in `api/views.py`. Views handle the request logic — they receive requests from the frontend, use serializers to validate/parse data, check user authentication, and perform the necessary database operations.

Key views created:
- `CreateUser` — registers a new user (uses Django's built-in User model which enforces unique usernames)
- `LoginUser` — authenticates user using Django's built-in `authenticate()` and `login()`
- `GetExpense` — returns all expenses for the authenticated user
- `CreateExpenseCategory` — creates a new expense category
- `CreateExpense` — creates a new expense entry

Example pattern:
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class GetExpense(APIView):
    def get(self, request, format=None):
        if self.request.user.is_authenticated:
            expenses = Expense.objects.all()
            serializer = ExpenseSerializer(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'Message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
```

### URLs
Registered all views in `api/urls.py` and included them in the main `financial_planner/urls.py`.

```python
# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('get-expense/', views.GetExpense.as_view()),
    path('create-expense/', views.CreateExpense.as_view()),
    path('create-category/', views.CreateExpenseCategory.as_view()),
    path('login/', views.LoginUser.as_view()),
    path('register/', views.CreateUser.as_view()),
]
```

```python
# financial_planner/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/', include('api.urls')),
]
```

> GET requests have been tested. POST requests are yet to be tested.

---

## Frontend Setup

### Vite + React
Used Vite instead of Webpack for a faster and simpler setup:

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
```

### Additional Dependencies

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-router-dom
```

### Final `package.json`

```json
"dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "@mui/material": "^9.0.0",
    "@mui/icons-material": "^9.0.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "react-router-dom": "^7.14.2"
},
"devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "vite": "^8.0.9"
}
```

---

## Connecting Frontend to Backend

### Vite Proxy (`vite.config.js`)
Configured Vite to forward `/api` requests to Django so the frontend doesn't need to hardcode the full backend URL:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    }
})
```

### CORS (`settings.py`)
Vite runs on `localhost:5173` and Django on `localhost:8000` — different origins. Without CORS, the browser blocks these requests. Installed `django-cors-headers` to allow cross-origin requests:

```bash
pip install django-cors-headers
```

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be at the top
    'django.middleware.security.SecurityMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]
```

---

## Project Structure

```
financial_planner/
├── api/                        # Django REST API app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── frontend/                   # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpenseList.jsx
│   │   │   │   ├── ExpenseItem.jsx
│   │   │   │   └── CreateExpense.jsx
│   │   │   ├── income/
│   │   │   ├── assets/
│   │   │   └── liabilities/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── financial_planner/          # Django project settings
    ├── settings.py
    └── urls.py
```

---

## Running the Project

```bash
# Terminal 1 — Django backend
python manage.py runserver

# Terminal 2 — Vite frontend
cd frontend
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## Reconfiguring After Vite Migration

After switching to Vite, the `frontend` Django app is no longer needed since Vite serves the React app on its own dev server at `localhost:5173`.

**Remove `frontend` from `INSTALLED_APPS` in `settings.py`:**
```python
INSTALLED_APPS = [
    ...
    'api',
    'rest_framework',
    'corsheaders',
]
```

**`frontend/urls.py` is also no longer needed** — delete it or leave it empty.

**`financial_planner/urls.py` should only include the api:**
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

Django now only serves the API. Vite handles everything frontend.

---

## Planned Features
- Expenses tracking with categories
- Income tracking
- Assets tracking
- Liabilities tracking
- Net Worth dashboard (`Assets - Liabilities`)
- Cash Flow summary (`Income - Expenses`)
