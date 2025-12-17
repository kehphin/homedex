# Recurring Tasks Implementation - Complete Summary

## Changes Made

### 1. Backend Model Updates

**File: `backend/owner/models.py`**

- Added `recurrence_days_of_week`: JSON field storing selected days for weekly recurrence
- Added `recurrence_days_of_month`: JSON field for monthly patterns (absolute days or relative patterns)

**Database Migration: `0014_task_recurrence_days_of_month_and_more.py`** (Already exists)

- Creates the two new JSON fields

### 2. Recurring Task Generation Logic

**File: `backend/owner/recurring_tasks.py`** (Completely refactored)

New/Updated Functions:

- `get_relative_day_of_month()`: Calculates dates for patterns like "First Monday" or "Last Friday"
- `calculate_next_due_date(task)`: Core logic that calculates the next due date based on:
  - Recurrence pattern (daily, weekly, monthly, yearly)
  - Pattern-specific configuration (days of week, days of month)
  - Recurrence interval
  - Latest instance of the recurring task
- `create_recurring_task_instances()`: Creates new task instances when due
- `send_recurring_task_email()`: Sends email notifications (unchanged)
- `get_recurring_task_stats()`: Gets statistics (unchanged)

Pattern Logic:

- **Daily**: Every X days, no specific days needed
- **Weekly**: Every X weeks on specified days of the week (0=Sun, 1=Mon, ..., 6=Sat)
- **Monthly**:
  - Absolute: Specific days (1-31) of the month
  - Relative: Nth occurrence of a day (e.g., "First Monday", "Last Friday")
- **Yearly**: Every X years on the same date

### 3. Celery Integration for Scheduling

**New File: `backend/backend/celery.py`**

- Configures Celery with Redis broker
- Sets up Celery Beat schedule to run task at 12:00 AM UTC daily
- Auto-discovers tasks from all apps

**Updated File: `backend/backend/__init__.py`**

- Imports and initializes Celery app

**New File: `backend/owner/tasks.py`**

- Defines Celery task: `create_recurring_task_instances_task()`
- Wrapper around the recurring task generation logic

**Updated File: `backend/backend/settings.py`**

- Added `django_celery_beat` to INSTALLED_APPS
- Added Celery configuration:
  ```python
  CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
  CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
  CELERY_TIMEZONE = 'UTC'
  ```

**Updated File: `backend/requirements.txt`**

- Added `celery[redis]>=5.3.0`
- Added `django-celery-beat>=2.5.0`

### 4. Frontend Updates

**Updated: `frontend/src/tasks/Tasks.tsx`**

- Removed generic "Repeat Every N" input
- Added pattern-specific UI components:
  - **Daily**: Number input for X days
  - **Weekly**: Number input for X weeks + multi-select checkboxes for days (Sun-Sat)
  - **Monthly**: Toggle between absolute days (1-31) and relative patterns
    - Absolute: Grid of checkboxes for days 1-31
    - Relative: Dropdowns for week selection (First-Last) and day selection
  - **Yearly**: Number input for X years
- Added smart default values based on current date
- Added form validation for required recurrence fields
- Updated form submission to send new recurrence fields

**Updated: `frontend/src/tasks/TasksService.ts`**

- Added `recurrence_days_of_week` to Task interface
- Added `recurrence_days_of_month` to Task interface (supports both numbers and relative objects)

**Backend Serializer: `backend/owner/serializers.py`**

- Updated TaskSerializer to include new recurrence fields

### 5. Documentation

**New File: `RECURRING_TASKS_SETUP.md`**

- Complete setup and deployment guide
- Architecture overview
- Configuration instructions
- Running in development and production
- Testing procedures
- Monitoring and troubleshooting

## How It Works

### Flow Diagram

```
1. User creates recurring task with pattern:
   - Daily/Weekly/Monthly/Yearly
   - Pattern-specific configuration (days selected)
   - Optional end date

2. Task stored in database with:
   - is_recurring = true
   - recurrence_pattern = pattern type
   - recurrence_interval = X
   - recurrence_days_of_week/month = selected days
   - parent_task = null (it's the parent)

3. Daily at 12:00 AM UTC:
   - Celery Beat triggers the task
   - create_recurring_task_instances() runs
   - For each recurring task:
     a. Get the latest instance (or use original due_date)
     b. Calculate next due date using calculate_next_due_date()
     c. If next due date <= today:
        - Create new task instance with is_recurring=false
        - Set parent_task to the recurring task
        - Create RecurringTaskInstance tracking record
        - Send email notification

4. Task instances:
   - Non-recurring copies of the recurring task
   - Can be edited independently
   - Have parent_task reference for tracking
   - RecurringTaskInstance links them together
```

## Environment Setup

### Required Services

- Redis (for Celery broker)
- PostgreSQL (for database)

### Environment Variables

```bash
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Running Locally

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Django + API
python manage.py runserver

# Terminal 3: Celery Worker
celery -A backend worker -l info

# Terminal 4: Celery Beat
celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Docker Deployment

See `RECURRING_TASKS_SETUP.md` for docker-compose configuration

## Testing

### Manual Test

```bash
# Create a test recurring task
python manage.py shell
>>> from owner.models import Task
>>> from datetime import date
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.first()
>>> Task.objects.create(
...     user=user,
...     title="Test Weekly",
...     due_date=date(2025, 12, 17),
...     is_recurring=True,
...     recurrence_pattern='weekly',
...     recurrence_interval=1,
...     recurrence_days_of_week=[0, 3],  # Sunday, Wednesday
...     category='General Maintenance',
...     priority='medium'
... )

# Test dry-run
python manage.py create_recurring_task_instances --dry-run

# Actually create instances
python manage.py create_recurring_task_instances
```

## Database Queries

### View all recurring tasks

```sql
SELECT * FROM owner_task WHERE is_recurring = true AND parent_task_id IS NULL;
```

### View task instances created from recurring

```sql
SELECT * FROM owner_task WHERE parent_task_id IS NOT NULL;
```

### View tracking records

```sql
SELECT * FROM owner_recurringtaskinstance;
```

### View scheduled tasks

```sql
SELECT * FROM django_celery_beat_periodictask;
```

## Key Design Decisions

1. **Pattern-Specific Storage**: Instead of generic recurrence_interval field, we store specific days using JSON fields for flexible patterns
2. **Relative Dates**: Monthly relative patterns (e.g., "Second Friday") are stored as objects in JSON
3. **Celery Beat**: Scheduled at 12:00 AM UTC daily for consistency
4. **Task Instances**: Recurring task creates non-recurring copies with parent_task reference
5. **Email Notifications**: Created instances trigger email notifications
6. **No Modification to Parent**: Instances can be edited independently without affecting parent recurrence rule

## Next Steps (Optional Enhancements)

- [ ] User timezone support (currently UTC only)
- [ ] Bulk edit recurring tasks
- [ ] Skip occurrences
- [ ] Completion-based recurrence (repeat after completing)
- [ ] Advanced patterns (every 2 weeks on specific days)
- [ ] Calendar view
- [ ] ical/calendar sync
- [ ] Task series management UI
