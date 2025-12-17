#!/bin/sh

set -e

echo "Waiting for postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
>&2 echo "Postgres is up - continuing"

# Change to a sensible working directory.
# Celery does not require manage.py; in some deployments /code may only contain the Django package.
if [ -f /code/manage.py ]; then
    cd /code
elif [ -f /code/backend/manage.py ]; then
    cd /code/backend
else
    cd /code
fi

# Set Django settings
export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-backend.settings}

# For celery_worker, run worker
if [ "$CELERY_MODE" = "worker" ]; then
    echo "Starting Celery worker..."
    exec celery -A backend worker -l info
elif [ "$CELERY_MODE" = "beat" ]; then
    echo "Starting Celery beat..."
    exec celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
else
    echo "Unknown CELERY_MODE: $CELERY_MODE"
    exit 1
fi


