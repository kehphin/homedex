# Notifications System - Setup & Deployment Guide

## Prerequisites

- Django backend running
- Celery & Redis configured
- Frontend build process set up
- Email service configured (Mailgun for production, MailHog for development)

## Backend Setup

### 1. Apply Migrations

```bash
cd backend
python manage.py migrate owner
```

This will create:

- `owner_notification` table
- `owner_notificationpreference` table
- Unique constraint on notifications

### 2. Verify Celery Configuration

Ensure `backend/backend/settings.py` has:

```python
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
```

### 3. Start Celery Beat (if not already running)

```bash
celery -A backend beat -l info
```

And in another terminal, start Celery worker:

```bash
celery -A backend worker -l info
```

### 4. Verify Email Configuration

**Development (MailHog):**

- Email will be sent to MailHog on localhost:1025
- View sent emails at http://localhost:1025

**Production (Mailgun):**

- Ensure `.env` has:

```
MAILGUN_API_KEY=your_api_key
DEFAULT_FROM_EMAIL=hello@homedex.app
```

### 5. Create Superuser and Test

```bash
python manage.py shell

from owner.notification_service import create_notifications_for_user
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Create test notifications
counts = create_notifications_for_user(user)
print(f"Created notifications: {counts}")
```

## Frontend Setup

### 1. Install Dependencies (if needed)

```bash
cd frontend
npm install
```

### 2. Build Frontend

```bash
npm run build
```

Or for development with hot reload:

```bash
npm start
```

### 3. Verify Routes

The following routes should now be available:

- `/account/notifications` - Main notifications page
- Notification bell icon in top-right of sidebar

## Testing the System

### 1. Create Test Tasks

1. Go to `/account/tasks`
2. Create a task due today
3. Create a task due in 3 days
4. Create a task due yesterday (overdue)

### 2. Trigger Notification Creation

```bash
# In Django shell
python manage.py shell

from owner.tasks import create_notifications_task
result = create_notifications_task()
print(result)  # Should show counts of created notifications
```

### 3. Check In-App Notifications

1. Refresh the frontend app
2. Click the bell icon in top-right
3. Should see notifications grouped by type with color coding

### 4. Test Email Sending

```bash
# In Django shell
from owner.tasks import send_weekly_email_notifications_task
result = send_weekly_email_notifications_task()
print(result)  # Should show sent_count and error_count

# Check sent emails at http://localhost:1025 (MailHog)
```

### 5. Test Preferences

1. Go to `/account/notifications` tab "Preferences"
2. Toggle email/in-app preferences
3. Change email frequency
4. Save and verify changes

## Docker Deployment

### Update docker-compose.yml

If using Docker, ensure:

1. Redis is running for Celery broker
2. Celery Beat service is configured
3. Celery Worker service is configured

Example `docker-compose.yml` additions:

```yaml
celery_beat:
  build: ./backend
  command: celery -A backend beat -l info
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
  depends_on:
    - redis
    - db

celery_worker:
  build: ./backend
  command: celery -A backend worker -l info
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
  depends_on:
    - redis
    - db
```

### Run Migrations in Docker

```bash
docker-compose exec backend python manage.py migrate owner
```

## Monitoring

### Check Celery Tasks

```bash
# List scheduled tasks
celery -A backend inspect scheduled

# List active tasks
celery -A backend inspect active

# Monitor in real-time
celery -A backend events
```

### Database Queries to Monitor

Check notification counts:

```sql
SELECT notification_type, COUNT(*) FROM owner_notification GROUP BY notification_type;
SELECT COUNT(*) as unread FROM owner_notification WHERE is_read = false;
```

Check last emails sent:

```sql
SELECT user_id, last_email_sent FROM owner_notificationpreference WHERE last_email_sent IS NOT NULL ORDER BY last_email_sent DESC LIMIT 10;
```

## Troubleshooting

### Issue: Notifications not being created

**Solution:**

1. Verify Celery Beat is running: `celery -A backend inspect active`
2. Check Celery logs for errors
3. Manually run: `python manage.py shell` and import `create_notifications_for_user`

### Issue: Emails not sending

**Solution:**

1. Check email configuration in `backend/backend/settings.py`
2. Verify `NotificationPreference.email_frequency != 'never'`
3. Check Celery worker logs for email errors
4. For dev, verify MailHog is running on port 1025

### Issue: Frontend not showing notifications

**Solution:**

1. Verify NotificationsService.ts has correct API_BASE URL
2. Check browser console for API errors
3. Ensure user is authenticated
4. Clear browser cache and hard refresh

### Issue: Duplicate notifications

**Solution:**

1. Unique constraint should prevent this
2. If duplicates exist, manually delete old ones:
   ```python
   from owner.models import Notification
   Notification.objects.filter(is_read=True).delete()
   ```

## Performance Considerations

### Database Indexes

The migrations create appropriate indexes on:

- `user_id` (for filtering by user)
- `notification_type` (for filtering by type)
- `is_read` (for unread count)
- Unique constraint on `(user_id, task_id, notification_type)`

### Query Optimization

- Use `select_related('user', 'task')` in viewsets
- Pagination limits default to 20 notifications
- Summary endpoint is lightweight with count queries only

### Celery Task Optimization

- Tasks are idempotent (unique constraint prevents duplicates)
- Email sending batches users efficiently
- Consider rate limiting for large user bases:
  ```python
  # Add to send_weekly_email_notifications_task
  send_mail(..., fail_silently=False)  # Will raise on error
  ```

## Scaling Recommendations

For production with many users:

1. **Separate Celery workers** - Run multiple workers on different machines
2. **Task rate limiting** - Use Celery rate limiting for email sending
3. **Database connection pooling** - Use PgBouncer for PostgreSQL
4. **Cache layer** - Consider caching notification summary with Redis
5. **Notification batching** - Batch email sending in chunks
6. **Archive old notifications** - Periodically delete read notifications older than 30 days

## Rollback Plan

If you need to disable notifications:

1. Set all `email_frequency` to `'never'` in database
2. Disable Celery tasks by removing from `beat_schedule`
3. Frontend components will still display but won't fetch/send
4. Keep database tables for data integrity

To completely remove:

1. Delete NotificationCenter button from SideMenu
2. Remove notifications route from Router
3. Run: `python manage.py migrate owner 0014` (reverse to previous migration)
4. Delete notification service and component files

## Next Steps

After deployment:

1. Monitor notification creation and email sending
2. Gather user feedback on notification usefulness
3. Adjust schedule if needed (currently: daily at 6am, email Monday 9am UTC)
4. Consider A/B testing different email frequencies
5. Plan for SMS/push notification integration in future
