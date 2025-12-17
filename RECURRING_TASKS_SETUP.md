# Recurring Tasks Scheduler Setup

## Overview

The recurring tasks system is now configured to automatically generate new task instances daily at **12:00 AM UTC** using Celery Beat.

## Architecture

### Components

1. **Backend Task Logic** (`backend/owner/recurring_tasks.py`)

   - `calculate_next_due_date(task)`: Calculates the next due date based on recurrence pattern and specific days
   - `create_recurring_task_instances(dry_run=False)`: Creates new task instances for recurring tasks that are due
   - Pattern-specific calculation functions for weekly, monthly, and relative patterns

2. **Celery Task** (`backend/owner/tasks.py`)

   - `create_recurring_task_instances_task()`: Celery shared task that runs on schedule

3. **Celery Beat Scheduler** (`backend/backend/celery.py`)
   - Configured to run the task daily at 12:00 AM UTC
   - Uses Redis as both broker and result backend

## Recurrence Pattern Support

### Daily

- Repeats every X days
- No specific days needed

### Weekly

- Repeats every X weeks on specified days of the week
- Stores selected days as indices: 0=Sunday, 1=Monday, ..., 6=Saturday
- Next occurrence is calculated based on the selected days

### Monthly

Two modes:

- **Absolute**: Select specific days (1-31) of the month
- **Relative**: Select a pattern like "First Monday" or "Last Friday"
  - Patterns: First, Second, Third, Fourth, Fifth, Last
  - Days: Day (any day of month), Sunday-Saturday

### Yearly

- Repeats every X years on the same date/month

## Database Fields

```python
Task model:
- is_recurring: Boolean indicating if task is recurring
- recurrence_pattern: 'daily', 'weekly', 'monthly', or 'yearly'
- recurrence_interval: Number of periods between recurrences (default: 1)
- recurrence_days_of_week: JSON array of day indices for weekly patterns [0-6]
- recurrence_days_of_month: JSON array of day numbers for monthly patterns, or
                            array with single object for relative patterns
- recurrence_end_date: Optional end date for recurrence (null = never ends)
- parent_task: Foreign key to the parent recurring task (for instances)
```

## Configuration

### Environment Variables (for `.env`)

```bash
# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Django Settings

The following are already configured in `backend/settings.py`:

```python
INSTALLED_APPS = [
    ...
    'django_celery_beat',
    ...
]

CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_TIMEZONE = 'UTC'
```

### Celery Beat Schedule

Configured in `backend/backend/celery.py`:

```python
app.conf.beat_schedule = {
    'create-recurring-task-instances': {
        'task': 'owner.tasks.create_recurring_task_instances_task',
        'schedule': crontab(hour=0, minute=0),  # Every day at 12:00 AM UTC
    },
}
```

## Running the Scheduler

### Development

1. **Start Redis** (required for message broker)

   ```bash
   redis-server
   ```

2. **Start Celery Worker**

   ```bash
   cd backend
   celery -A backend worker -l info
   ```

3. **Start Celery Beat Scheduler**
   ```bash
   cd backend
   celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
   ```

### Production (Docker Compose)

Add the following services to your `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5

celery_worker:
  build:
    context: ./backend
    dockerfile: Dockerfile
  command: celery -A backend worker -l info
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
    - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
  depends_on:
    - redis
    - db
  volumes:
    - ./backend:/app

celery_beat:
  build:
    context: ./backend
    dockerfile: Dockerfile
  command: celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
    - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
  depends_on:
    - redis
    - db
  volumes:
    - ./backend:/app

volumes:
  redis_data:
```

## Testing

### Manual Testing

Run the management command directly:

```bash
python manage.py create_recurring_task_instances
```

With dry-run mode (shows what would be created without creating):

```bash
python manage.py create_recurring_task_instances --dry-run
```

### Testing Specific Patterns

Create test recurring tasks with different patterns:

```python
from owner.models import Task
from datetime import date
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Weekly task - every Monday and Wednesday
task = Task.objects.create(
    user=user,
    title="Weekly Test",
    due_date=date(2025, 12, 17),  # Wednesday
    is_recurring=True,
    recurrence_pattern='weekly',
    recurrence_interval=1,
    recurrence_days_of_week=[1, 3],  # 1=Monday, 3=Wednesday
    category='General Maintenance',
    priority='medium'
)

# Monthly task - 1st and 15th of each month
task = Task.objects.create(
    user=user,
    title="Monthly Test",
    due_date=date(2025, 12, 1),
    is_recurring=True,
    recurrence_pattern='monthly',
    recurrence_interval=1,
    recurrence_days_of_month=[1, 15],
    category='General Maintenance',
    priority='medium'
)

# Monthly task - First Monday of each month
task = Task.objects.create(
    user=user,
    title="Monthly Relative Test",
    due_date=date(2025, 12, 1),
    is_recurring=True,
    recurrence_pattern='monthly',
    recurrence_interval=1,
    recurrence_days_of_month=[{'type': 'relative', 'week': 'first', 'day': 'Monday'}],
    category='General Maintenance',
    priority='medium'
)
```

## Monitoring

### View Scheduled Tasks in Django Admin

1. Go to `/admin/django_celery_beat/periodictask/`
2. View all scheduled tasks and their next run times

### Check Celery Worker Logs

Look for task execution logs in the Celery worker output:

```
[2025-12-17 12:00:00,123: INFO/MainProcess] Received task: owner.tasks.create_recurring_task_instances_task[...]
[2025-12-17 12:00:05,456: INFO/MainProcess] Task owner.tasks.create_recurring_task_instances_task[...] succeeded in 5.333s
```

### Check Task Results

```python
from celery.result import AsyncResult

# Get the result of a specific task
result = AsyncResult('task-uuid-here')
print(result.result)  # View the return value
```

## Troubleshooting

### Tasks Not Running

1. Verify Redis is running: `redis-cli ping` (should return `PONG`)
2. Check Celery Beat is running: Look for beat logs in console
3. Verify schedule is in database: `SELECT * FROM django_celery_beat_periodictask;`

### Incorrect Task Calculations

1. Check the task's recurrence settings in Django admin
2. Verify timezone is UTC: `python manage.py shell` → `from django.utils import timezone; print(timezone.get_current_timezone())`
3. Test calculation manually: `python manage.py create_recurring_task_instances --dry-run`

### Email Notifications Not Sending

1. Verify user has an email address: `User.objects.filter(email__isnull=False).count()`
2. Check email settings in `settings.py`
3. Verify DEFAULT_FROM_EMAIL is set in environment

## Future Enhancements

- [ ] Add task execution history tracking
- [ ] Implement exponential backoff for failed tasks
- [ ] Add email digest of upcoming recurring tasks
- [ ] Create UI for viewing schedule and manual triggering
- [ ] Support for timezones (currently UTC only)
- [ ] Support for custom patterns (every 2 weeks on specific days)
