#!/bin/sh

set -e

echo "Waiting for postgres..."
wait-for-postgres.sh

echo "Running migrations..."

# Run core Django migrations first to ensure auth_user table exists
python manage.py migrate auth
python manage.py migrate contenttypes
python manage.py migrate admin
python manage.py migrate sessions

# Now run all migrations including djstripe and custom apps
python manage.py migrate

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
python manage.py collectstatic --noinput

# We are handling the gunicorn server here instead of creating a Dockerfile.prod file.
if [ "$DEBUG" = "True" ]; then
    echo "Starting development server..."
    exec python manage.py runserver 0.0.0.0:8000
else
    echo "Starting Gunicorn server..."
    exec gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
fi
