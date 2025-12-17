# Docker Compose Celery Quick Reference

## TL;DR

Just run:

```bash
docker compose up
```

Celery worker and beat scheduler will automatically start with all the other services.

## Services Added to docker-compose.yml

### Redis

- Message broker for Celery tasks
- Result backend for task results
- Data persists in `redis_data` volume

### Celery Worker

- Processes tasks from Redis queue
- Command: `celery -A backend worker -l info`
- Logs go to `docker compose logs celery_worker`

### Celery Beat

- Scheduler for recurring tasks
- Runs at 12:00 AM UTC daily
- Uses DatabaseScheduler (persists to database)

## Verify Everything is Running

```bash
# Check all services
docker compose ps

# Check specific services
docker compose ps redis
docker compose ps celery_worker
docker compose ps celery_beat

# Test Redis
docker compose exec redis redis-cli ping
# Should return: PONG

# Test Celery worker
docker compose exec backend celery -A backend inspect active
```

## View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f celery_worker
docker compose logs -f celery_beat
docker compose logs -f redis
```

## Common Commands

```bash
# Stop all services
docker compose down

# Restart Celery worker
docker compose restart celery_worker

# Rebuild containers (after code changes)
docker compose up --build

# Clean rebuild (remove old images)
docker compose down
docker compose up --build

# Run management command with Celery access
docker compose exec backend python manage.py create_recurring_task_instances --dry-run
```

## Testing Recurring Tasks

```bash
# Dry-run to see what would be created
docker compose exec backend python manage.py create_recurring_task_instances --dry-run

# Actually create instances
docker compose exec backend python manage.py create_recurring_task_instances

# Access Django shell
docker compose exec backend python manage.py shell
```

## Troubleshooting

| Issue                        | Solution                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| Redis connection refused     | Check `docker compose logs redis` and verify it's healthy                 |
| Celery worker not processing | Check `docker compose ps celery_worker` is running                        |
| Tasks not being created      | Verify Celery Beat is running and check `docker compose logs celery_beat` |
| Redis data lost              | Don't use `docker compose down -v` unless intentional                     |
| Worker keeps restarting      | Check logs: `docker compose logs celery_worker`                           |

## Network Communication

- **Backend → Redis**: Uses hostname `redis:6379`
- **Celery Worker → Redis**: Uses hostname `redis:6379`
- **Celery Beat → Redis**: Uses hostname `redis:6379`
- **Celery → Database**: Uses hostname `db`

All services communicate on the default Docker network created by docker-compose.

## Environment Variables Set Automatically

```yaml
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

These override the defaults in settings.py for Docker environment.

## That's It!

Your Celery worker and scheduler are now running automatically with `docker compose up`. 🎉
