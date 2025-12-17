#!/bin/sh

set -e

echo "Waiting for postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
>&2 echo "Postgres is up - continuing"

export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-backend.settings}

# Verify database connection and print version
echo "Verifying database connection..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" || echo "Warning: Could not query database"
echo "Database connection verified."

echo "Running migrations..."

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

# Let Django handle migration order based on dependencies
${DJANGO_CMD} migrate --noinput

# echo "Setting up Stripe API keys..."
# python manage.py shell <<EOF
# from djstripe.models import APIKey
# from django.conf import settings
# if settings.STRIPE_TEST_SECRET_KEY:
#     APIKey.objects.get_or_create_by_api_key(secret=settings.STRIPE_TEST_SECRET_KEY)
# if settings.STRIPE_LIVE_SECRET_KEY:
#     APIKey.objects.get_or_create_by_api_key(secret=settings.STRIPE_LIVE_SECRET_KEY)
# EOF

# Optional, feel free to uncomment if you want this, but it's takes a while.
echo "Syncing DJ-Stripe models..."
# python manage.py djstripe_sync_models

# collect static
echo "Collecting static files..."
${DJANGO_CMD} collectstatic --noinput

# We are handling the gunicorn server here instead of creating a Dockerfile.prod file.
if [ "$DEBUG" = "True" ]; then
    echo "Starting development server..."
  exec ${DJANGO_CMD} runserver 0.0.0.0:8000
else
    echo "Starting Gunicorn server..."
    exec gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
fi
