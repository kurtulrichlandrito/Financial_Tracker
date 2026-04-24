# Fixing CSRF + CORS for Django + Vite (React)

## The Problem
POST requests from Vite (`localhost:5173`) to Django (`localhost:8000`) were being blocked with 403 errors due to CSRF and CORS restrictions.

---

## Steps to Fix

### 1. Install `django-cors-headers`
```bash
pip install django-cors-headers
```

### 2. Add to `INSTALLED_APPS`
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]
```

### 3. Add `CorsMiddleware` at the top of `MIDDLEWARE`
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    ...
]
```

### 4. Add these settings to `settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]

CORS_ALLOW_CREDENTIALS = True  # allows cookies to be sent cross-origin

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
]
```

### 5. Send the CSRF token with every POST request on the frontend
Django requires the `csrftoken` cookie to be included as a header in POST requests.

```javascript
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

fetch('/api/logout/', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'X-CSRFToken': getCookie('csrftoken'),
    },
})
```

---

## Why Each Step Matters

| Setting | Why |
|---|---|
| `CORS_ALLOWED_ORIGINS` | Tells Django to accept requests from Vite's dev server |
| `CORS_ALLOW_CREDENTIALS` | Allows cookies (like `sessionid`) to be sent cross-origin |
| `CSRF_TRUSTED_ORIGINS` | Tells Django to trust POST requests coming from Vite |
| `X-CSRFToken` header | Proves to Django the request came from your own frontend |
| `credentials: 'include'` | Tells the browser to include cookies in the request |

---

## Notes
- The `csrftoken` cookie is set by Django after the first login.
- GET requests do not require the CSRF token — only POST, PUT, DELETE.
- In production, replace `localhost:5173` with your actual frontend domain.
