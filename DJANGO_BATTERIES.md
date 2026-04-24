# Django Batteries — Built-in Features Reference

Django is known for being "batteries included" — it comes with a lot of built-in tools so you don't have to build everything from scratch.

---

## Authentication

Django has a full authentication system built in. No need to build your own.

### User Model
```python
from django.contrib.auth.models import User
```

Key fields already included:
- `username` — unique by default
- `password` — always stored hashed, never plain text
- `email`
- `is_authenticated` — returns True if user is logged in
- `is_staff` — can access admin panel
- `is_superuser` — has all permissions

### Creating a User
Always use `create_user()` — it hashes the password automatically:
```python
user = User.objects.create_user(username='john', password='secret')
```
Never use `create()` directly for users — it stores the password as plain text.

### Authenticating a User
```python
from django.contrib.auth import authenticate, login, logout

# checks credentials, returns user or None
user = authenticate(request, username=username, password=password)

# creates a session for the user
login(request, user)

# ends the session
logout(request)
```

### Checking if User is Logged In
```python
if request.user.is_authenticated:
    # user is logged in
```

---

## ORM (Object Relational Mapper)

Django's ORM lets you interact with the database using Python instead of SQL.

### Common Queries
```python
# get all records
Model.objects.all()

# get one record (raises error if not found)
Model.objects.get(id=1)

# filter records
Model.objects.filter(user=user)

# check if exists
Model.objects.filter(username='john').exists()

# get or create
obj, created = Model.objects.get_or_create(name='Food')

# delete
Model.objects.filter(id=1).delete()

# update
Model.objects.filter(id=1).update(name='New Name')
```

### Deleting a Single Object
```python
obj = Model.objects.get(id=1)
obj.delete()  # don't forget the parentheses!
```

---

## Models

### Field Types
```python
models.CharField(max_length=100)       # short text
models.TextField()                      # long text
models.IntegerField()                   # whole numbers
models.DecimalField(max_digits=10, decimal_places=2)  # money/decimals
models.BooleanField(default=False)      # true/false
models.DateTimeField(auto_now_add=True) # timestamp on creation
models.DateField()                      # date only
models.ForeignKey(User, on_delete=models.CASCADE)  # relationship
```

### `__str__` Method
Controls how objects are displayed in the admin panel and shell:
```python
class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name  # shows name instead of "ExpenseCategory object (1)"
```

### Migrations
Every time you change a model, you need to run migrations:
```python
python manage.py makemigrations  # creates migration file
python manage.py migrate         # applies changes to DB
```

---

## Admin Panel

Django gives you a full admin UI for free at `/admin`.

### Setup
```python
# api/admin.py
from django.contrib import admin
from .models import Expense, ExpenseCategory

admin.site.register(Expense)
admin.site.register(ExpenseCategory)
```

### Create a superuser to access it
```bash
python manage.py createsuperuser
```

Then visit `http://localhost:8000/admin` to manage your database through a UI.

---

## Django Shell

Access a Python shell with your full Django project loaded:
```bash
python manage.py shell
```

Useful for testing queries without running the server:
```python
from django.contrib.auth.models import User
from api.models import Expense

User.objects.all()
Expense.objects.filter(user=User.objects.get(username='john'))
```

---

## Sessions

Django handles sessions automatically — this is how it tracks who is logged in.

```python
# create a session if it doesn't exist
if not request.session.exists(request.session.session_key):
    request.session.create()

# store data in session
request.session['room_code'] = code

# read from session
code = request.session.get('room_code')
```

Sessions are stored in the database by default.

---

## Settings

Key settings to know in `settings.py`:

```python
# Apps that are active
INSTALLED_APPS = [...]

# Database config
DATABASES = {...}

# Secret key — never expose this publicly
SECRET_KEY = '...'

# Allowed hosts in production
ALLOWED_HOSTS = []

# Static files location
STATIC_URL = '/static/'
```

---

## Management Commands

Useful built-in commands:

```bash
python manage.py runserver          # start dev server
python manage.py makemigrations     # create migration files
python manage.py migrate            # apply migrations
python manage.py createsuperuser    # create admin user
python manage.py shell              # open interactive shell
python manage.py startapp appname   # create a new app
python manage.py collectstatic      # gather static files for production
```

---

## Django REST Framework Extras

DRF adds more batteries on top of Django:

### Status Codes
```python
from rest_framework import status

status.HTTP_200_OK
status.HTTP_201_CREATED
status.HTTP_400_BAD_REQUEST
status.HTTP_401_UNAUTHORIZED
status.HTTP_404_NOT_FOUND
```

### Browsable API
DRF auto-generates a UI for every endpoint at `localhost:8000/api/`. Add `serializer_class` to your view to get a proper HTML form instead of a raw JSON box:
```python
class CreateExpense(APIView):
    serializer_class = ExpenseSerializer
```

### `serializer_class` vs `serializer` instance
- `serializer_class = ExpenseSerializer` — tells DRF what serializer the view uses (used for the browsable API UI)
- `serializer = ExpenseSerializer(data=request.data)` — actually processes and validates data

---

## Password Hashing

Django hashes passwords using `PBKDF2` by default. A hashed password looks like:
```
pbkdf2_sha256$600000$randomsalt$hashedvalue
```

If your password in the DB doesn't start with `pbkdf2_sha256$`, it was stored as plain text and `authenticate()` will always fail.

Always use `create_user()` to avoid this.
