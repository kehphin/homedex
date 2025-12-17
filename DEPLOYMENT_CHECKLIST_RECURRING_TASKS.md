# Recurring Tasks Deployment Checklist

## Pre-Deployment

### Backend Setup

- [ ] Run database migration: `python manage.py migrate owner`
- [ ] Install new packages: `pip install -r requirements.txt`
- [ ] Test in development environment

### Dependencies Installed

- [ ] Celery 5.3.0+
- [ ] Django Celery Beat 2.5.0+
- [ ] Redis 6.0+ (for message broker)

### Environment Configuration

- [ ] Set `CELERY_BROKER_URL=redis://...` in .env
- [ ] Set `CELERY_RESULT_BACKEND=redis://...` in .env
- [ ] Verify `CELERY_TIMEZONE = 'UTC'` in settings

## Development Testing

### Manual Testing

- [ ] Create a recurring daily task
- [ ] Create a recurring weekly task (multiple days)
- [ ] Create a recurring monthly task (absolute days)
- [ ] Create a recurring monthly task (relative pattern)
- [ ] Create a recurring yearly task
- [ ] Run `python manage.py create_recurring_task_instances --dry-run`
- [ ] Verify task calculation is correct
- [ ] Run `python manage.py create_recurring_task_instances`
- [ ] Verify tasks were created
- [ ] Check email notifications sent

### Process Testing

- [ ] Start Redis: `redis-server`
- [ ] Start Django: `python manage.py runserver`
- [ ] Start Celery Worker: `celery -A backend worker -l info`
- [ ] Start Celery Beat: `celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler`
- [ ] Verify task executes at midnight (or test with immediate schedule)
- [ ] Check logs for execution status
- [ ] Verify new tasks created in database

## Frontend Testing

### UI Testing

- [ ] Create new recurring task with daily pattern
- [ ] Create new recurring task with weekly pattern
  - [ ] Select multiple days
  - [ ] Select different interval
- [ ] Create new recurring task with monthly absolute pattern
  - [ ] Select multiple days
  - [ ] Select different interval
- [ ] Create new recurring task with monthly relative pattern
  - [ ] Test different weeks (First, Second, ..., Last)
  - [ ] Test different days (Monday, Tuesday, etc.)
  - [ ] Test "day" option
- [ ] Create new recurring task with yearly pattern
- [ ] Test end date selection
- [ ] Test form validation (required fields)
- [ ] Test editing recurring task
- [ ] Test deleting recurring task

## Production Deployment

### Infrastructure Setup

- [ ] Redis service running and accessible
- [ ] PostgreSQL database running and accessible
- [ ] Celery worker deployed
- [ ] Celery Beat scheduler deployed
- [ ] Health checks configured for both services

### Docker/Kubernetes

If using containers:

- [ ] Docker images built for celery worker and beat
- [ ] `docker-compose.yml` updated with redis, celery worker, and celery beat services
- [ ] Environment variables set in container runtime
- [ ] Persistent volume for Redis data
- [ ] Logging configured for worker and beat

### Monitoring Setup

- [ ] Celery worker monitoring configured
- [ ] Celery Beat monitoring configured
- [ ] Email service verified (for task notifications)
- [ ] Database backup configured
- [ ] Log aggregation set up

### Load Testing

- [ ] Create 100+ recurring tasks with varied patterns
- [ ] Run task generation in dry-run mode
- [ ] Verify performance is acceptable
- [ ] Check memory/CPU usage of worker and beat
- [ ] Verify database queries are optimized

## Post-Deployment Verification

### Immediate Checks (After Deploy)

- [ ] Application starts without errors
- [ ] Celery worker processes tasks
- [ ] Celery Beat scheduler running
- [ ] Database migrations applied
- [ ] Django admin accessible
- [ ] Recurring task UI functional

### Day 1 Checks (Next Morning)

- [ ] Check that tasks were generated at 12:00 AM UTC
- [ ] Verify email notifications sent
- [ ] Review logs for any errors
- [ ] Spot check 10+ created tasks
- [ ] Verify parent task references correct

### Week 1 Checks

- [ ] Monitor Celery worker for issues
- [ ] Monitor Redis for connection problems
- [ ] Test a new recurring task creation
- [ ] Verify monthly relative pattern worked correctly
- [ ] Check for any email delivery failures

## Rollback Plan

If issues occur:

1. **Stop Celery processes**

   ```bash
   celery control shutdown
   ```

2. **Disable scheduled task** (in Django admin or database)

   ```sql
   UPDATE django_celery_beat_periodictask SET enabled = false
   WHERE task = 'owner.tasks.create_recurring_task_instances_task';
   ```

3. **Revert migrations** (if needed)

   ```bash
   python manage.py migrate owner 0013
   ```

4. **Remove from requirements.txt** and reinstall
   ```bash
   pip install -r requirements.txt
   ```

## Troubleshooting Commands

### Check if Celery is running

```bash
celery -A backend inspect active
```

### Check scheduled tasks

```bash
celery -A backend inspect scheduled
```

### Clear queue

```bash
celery -A backend purge
```

### Test task execution

```bash
celery -A backend call owner.tasks.create_recurring_task_instances_task
```

### View task results

```python
# In Django shell
from celery.result import AsyncResult
result = AsyncResult('task-uuid')
print(result.status)
print(result.result)
```

### Database checks

```sql
-- Check recurring tasks
SELECT COUNT(*) FROM owner_task WHERE is_recurring = true AND parent_task_id IS NULL;

-- Check created instances (last 7 days)
SELECT COUNT(*) FROM owner_task
WHERE parent_task_id IS NOT NULL
AND created_at >= NOW() - INTERVAL '7 days';

-- Check scheduled tasks
SELECT * FROM django_celery_beat_periodictask;
```

## Monitoring Metrics

Track these metrics for production:

- [ ] Number of recurring tasks created per day
- [ ] Number of task instances created per day
- [ ] Average calculation time per recurring task
- [ ] Celery worker CPU/Memory usage
- [ ] Redis memory usage
- [ ] Email notification success rate
- [ ] Database query performance

## Support Resources

- Documentation: `RECURRING_TASKS_SETUP.md`
- Implementation Summary: `RECURRING_TASKS_COMPLETE.md`
- Celery Documentation: https://docs.celeryproject.org/
- Django Celery Beat: https://github.com/celery/django-celery-beat

## Sign-Off

- [ ] Development Lead: ********\_******** Date: **\_\_\_**
- [ ] QA Lead: ************\_************ Date: **\_\_\_**
- [ ] DevOps/Infrastructure: ****\_\_\_**** Date: **\_\_\_**
- [ ] Product Owner: ********\_\_******** Date: **\_\_\_**
