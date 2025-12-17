# Running Celery with Docker Compose

## Quick Start

Simply run:

```bash
docker compose up
```

This will automatically start:

- **Redis** (message broker on port 6379)
- **Backend** (Django API on port 8000)
- **Celery Worker** (processes async tasks)
- **Celery Beat** (scheduler for recurring tasks at 12:00 AM UTC)
- Plus other services (frontend, astro, db, etc.)

## What's Running

### Redis Service

```yaml
redis:
  image: redis:7-alpine
  ports:
    - 6379:6379
```

- In-memory message broker and result backend
- Persists data to `redis_data` volume

### Celery Worker Service

```yaml
celery_worker:
  command: celery -A backend worker -l info
  depends_on:
    - db
    - redis
```

- Processes Celery tasks from the queue
- Logs at INFO level (change `-l info` to `-l debug` for more verbosity)
- Automatically retries if Redis is not available

### Celery Beat Service

```yaml
celery_beat:
  command: celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
  depends_on:
    - db
    - redis
```

- Scheduler that triggers recurring tasks
- Uses database scheduler (persists schedule in database)
- Runs daily task at 12:00 AM UTC

## Viewing Logs

### All services

```bash
docker compose logs -f
```

### Just Celery Worker

```bash
docker compose logs -f celery_worker
```

### Just Celery Beat

```bash
docker compose logs -f celery_beat
```

### Just Redis

```bash
docker compose logs -f redis
```

## Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (careful! removes data)
docker compose down -v

# Stop specific service
docker compose stop celery_worker

# Restart specific service
docker compose restart celery_worker
```

## Checking Service Status

### Check if all services are running

```bash
docker compose ps
```

Output should show:

```
NAME              COMMAND                  SERVICE         STATUS
homedex-redis-1          redis-server             redis           Up
homedex-db-1             postgres                 db              Up
homedex-backend-1        entrypoint.sh            backend         Up
homedex-celery_worker-1  celery -A backend...    celery_worker   Up
homedex-celery_beat-1    celery -A backend...    celery_beat     Up
...
```

### Check Redis connectivity

```bash
docker compose exec redis redis-cli ping
# Should return: PONG
```

### Check Celery worker status

```bash
docker compose exec backend celery -A backend inspect active
```

## Troubleshooting

### Celery worker not connecting to Redis

**Error**: `Connection refused` or `Cannot connect to Redis`

**Solution**:

1. Ensure Redis is running: `docker compose logs redis`
2. Check `CELERY_BROKER_URL` environment variable is set correctly
3. In docker-compose.yml it should be: `redis://redis:6379/0`

### Celery Beat not running tasks

**Check**:

1. Verify Celery Beat is running: `docker compose ps | grep celery_beat`
2. Check logs: `docker compose logs celery_beat`
3. Verify database scheduler tables exist:
   ```bash
   docker compose exec backend python manage.py migrate django_celery_beat
   ```

### Tasks not being processed

**Check**:

1. Is the Celery worker running? `docker compose ps celery_worker`
2. Are there tasks in the queue? `docker compose exec backend celery -A backend inspect active_queues`
3. Check worker logs: `docker compose logs -f celery_worker`

### Redis data persisting

Redis data is stored in the `redis_data` Docker volume. It persists across:

- `docker compose restart redis`
- `docker compose stop` / `docker compose start`

But is deleted when you run:

- `docker compose down -v` (with -v flag)

## Environment Variables

These are automatically set in docker-compose.yml:

```yaml
environment:
  - CELERY_BROKER_URL=redis://redis:6379/0
  - CELERY_RESULT_BACKEND=redis://redis:6379/0
```

They override any defaults in `settings.py` which would be:

```
CELERY_BROKER_URL=redis://localhost:6379/0
```

The Docker version uses the service name `redis` instead of `localhost`.

## Manual Testing

### Test task execution

```bash
# Execute the recurring task immediately
docker compose exec backend celery -A backend call owner.tasks.create_recurring_task_instances_task
```

### Access Django shell with Celery

```bash
docker compose exec backend python manage.py shell
>>> from owner.tasks import create_recurring_task_instances_task
>>> result = create_recurring_task_instances_task.delay()
>>> result.get()
```

### Monitor task execution

```bash
# Watch tasks being processed in real-time
docker compose exec celery_worker celery -A backend events
```

## Performance Tuning

### Increase worker concurrency

Edit docker-compose.yml, celery_worker service:

```yaml
command: celery -A backend worker -l info --concurrency 4
```

Default is number of CPU cores. For local development, 2-4 is usually sufficient.

### Adjust worker pool type

```yaml
command: celery -A backend worker -l info --pool threads
```

Options: `prefork` (default), `threads`, `solo`

### Enable task result expiry

Add to backend environment in docker-compose.yml:

```yaml
environment:
  - CELERY_RESULT_EXPIRES=3600
```

Time in seconds before task results are discarded (default: 24 hours).

## Production Considerations

1. **Use separate queues** for different task priorities
2. **Enable task acknowledgment** with `--acks-late` flag
3. **Set resource limits** on containers
4. **Use persistent storage** for Redis (RDB or AOF)
5. **Monitor worker health** with supervisor or systemd
6. **Scale workers** by increasing replicas:
   ```yaml
   deploy:
     replicas: 2
   ```

## Next Steps

After verifying everything is running:

1. Create a test recurring task via the API or Django admin
2. Check that it was created: `docker compose exec backend python manage.py create_recurring_task_instances --dry-run`
3. Wait for the next scheduled time (or edit settings to test sooner)
4. Verify new task instances are created: `docker compose logs celery_beat`
