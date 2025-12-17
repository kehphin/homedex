#!/bin/sh

set -e

echo "Waiting for postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
>&2 echo "Postgres is up - continuing"

echo "Running migrations..."

export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-backend.settings}

# Prefer manage.py when available; otherwise use `python -m django`.
if [ -f /code/manage.py ]; then
  cd /code
  DJANGO_CMD="python manage.py"
elif [ -f /code/backend/manage.py ]; then
  cd /code/backend
  DJANGO_CMD="python manage.py"
else
  cd /code
  DJANGO_CMD="python -m django"
  echo "Warning: manage.py not found; using 'python -m django'"
fi

${DJANGO_CMD} migrate --noinput

echo "Collecting static files..."
${DJANGO_CMD} collectstatic --noinput

echo "✅ Migrations and setup completed successfully!"
