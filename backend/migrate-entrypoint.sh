#!/bin/sh

set -e

echo "Waiting for postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
>&2 echo "Postgres is up - continuing"

echo "Running migrations..."

# Change to the directory that contains manage.py
if [ -f /code/manage.py ]; then
  cd /code
elif [ -f /code/backend/manage.py ]; then
  cd /code/backend
else
  echo "Could not find manage.py in /code or /code/backend"
  echo "Contents of /code:"
  ls -la /code || true
  exit 1
fi
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Migrations and setup completed successfully!"
