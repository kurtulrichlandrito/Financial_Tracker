#!/bin/sh
set -e

python manage.py collectstatic --noinput
python manage.py migrate --noinput
gunicorn financial_planner.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
