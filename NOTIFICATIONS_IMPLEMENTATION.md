# Alerts/Notifications System Implementation

## Overview

This implementation adds a comprehensive alerts and notifications system to Homedex, allowing users to be reminded of upcoming tasks, overdue tasks, and tasks due today. The system includes:

- **In-app notifications** - Real-time notification center with badge count
- **Email notifications** - Weekly digest emails with task summaries
- **User preferences** - Customizable notification settings
- **Task tracking** - Automatic notification generation based on task due dates

## Architecture

### Backend Components

#### 1. **Models** (`backend/owner/models.py`)

**Notification Model**

- Stores individual notifications for users
- Types: `overdue`, `due_today`, `due_soon`
- Fields:
  - `user` - Foreign key to User
  - `task` - Foreign key to Task
  - `notification_type` - Type of notification
  - `title` - Notification title
  - `message` - Notification message
  - `is_read` - Read status
  - `created_at` - Creation timestamp
  - `read_at` - When notification was read
- Unique constraint: `(user, task, notification_type)` - Prevents duplicate notifications

**NotificationPreference Model**

- User preferences for notifications
- Fields:
  - `user` - One-to-one with User
  - `email_overdue_tasks` - Enable email for overdue tasks
  - `email_due_soon_tasks` - Enable email for upcoming tasks
  - `email_frequency` - `daily`, `weekly`, or `never`
  - `inapp_overdue_tasks` - Enable in-app notifications for overdue
  - `inapp_due_soon_tasks` - Enable in-app notifications for upcoming
  - `last_email_sent` - Timestamp of last sent email

#### 2. **Services** (`backend/owner/notification_service.py`)

**Key Functions:**

- `get_upcoming_and_overdue_tasks(user)` - Retrieves tasks from today to 7 days out and overdue tasks
- `create_notifications_for_user(user)` - Creates in-app notifications based on task status
- `should_send_email_notification(user)` - Checks if user should receive email based on frequency
- `get_email_notification_content(user)` - Generates formatted email content
- `update_email_sent_timestamp(user)` - Updates last email sent time

#### 3. **Celery Tasks** (`backend/owner/tasks.py`)

**create_notifications_task()**

- Scheduled: Daily at 6:00 AM UTC
- Creates in-app notifications for all users
- Filters based on user preferences

**send_weekly_email_notifications_task()**

- Scheduled: Every Monday at 9:00 AM UTC
- Sends weekly email digest to all active users
- Only sends to users with email frequency set to `weekly`
- Respects email preference toggles

#### 4. **API Endpoints** (`backend/owner/views.py`)

**NotificationViewSet**

- `GET /api/v1/owner/notifications/` - List notifications (paginated)
- `POST /api/v1/owner/notifications/mark_as_read/{id}/` - Mark single notification as read
- `POST /api/v1/owner/notifications/mark_all_as_read/` - Mark all as read
- `GET /api/v1/owner/notifications/unread_count/` - Get unread count
- `GET /api/v1/owner/notifications/summary/` - Get summary (overdue, due_today, due_soon counts)

**NotificationPreferenceViewSet**

- `GET /api/v1/owner/notification-preferences/` - Get user preferences
- `POST /api/v1/owner/notification-preferences/` - Update preferences

#### 5. **Admin Interface** (`backend/owner/admin.py`)

- NotificationAdmin - Manage notifications with filtering and search
- NotificationPreferenceAdmin - Manage user preferences

### Frontend Components

#### 1. **NotificationsService** (`frontend/src/notifications/NotificationsService.ts`)

TypeScript service with functions for:

- `getNotifications()` - Fetch notifications (paginated)
- `getUnreadNotificationCount()` - Get unread badge count
- `getNotificationSummary()` - Get counts by type
- `markNotificationAsRead(id)` - Mark single as read
- `markAllNotificationsAsRead()` - Mark all as read
- `getNotificationPreferences()` - Fetch user preferences
- `updateNotificationPreferences()` - Update preferences

#### 2. **NotificationCenter** (`frontend/src/notifications/NotificationCenter.tsx`)

React component featuring:

- Bell icon button with badge count
- Modal showing all notifications
- Summary stats (overdue, due_today, due_soon)
- Color-coded notifications by type
- Read/unread status indicators
- Mark as read functionality
- 30-second auto-refresh of summary
- Responsive design

#### 3. **NotificationPreferences** (`frontend/src/notifications/NotificationPreferences.tsx`)

React component for managing preferences:

- Toggle email notifications by type
- Set email frequency (daily, weekly, never)
- Toggle in-app notifications by type
- Display last email sent time
- Save changes with validation

#### 4. **Notifications Page** (`frontend/src/notifications/Notifications.tsx`)

Main notifications page with:

- Tabbed interface
- Notification Center tab
- Preferences tab
- Responsive layout

#### 5. **SideMenu Updates** (`frontend/src/components/SideMenu.tsx`)

- Added NotificationCenter button in top-right
- Added Notifications link in main menu (under Dashboard)
- Bell icon with unread count badge

### Database Migrations

Migration `0015_notification_notificationpreference.py` creates:

- Notification table with indexes
- NotificationPreference table with one-to-one user relationship
- Unique constraint on (user, task, notification_type)

## Task Scheduling

Updated Celery Beat schedule in `backend/backend/celery.py`:

```python
app.conf.beat_schedule = {
    'create-recurring-task-instances': {
        'task': 'owner.tasks.create_recurring_task_instances_task',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight UTC
    },
    'create-notifications': {
        'task': 'owner.tasks.create_notifications_task',
        'schedule': crontab(hour=6, minute=0),  # Daily at 6am UTC
    },
    'send-weekly-email-notifications': {
        'task': 'owner.tasks.send_weekly_email_notifications_task',
        'schedule': crontab(day_of_week=1, hour=9, minute=0),  # Monday 9am UTC
    },
}
```

## Email Configuration

The system uses Django's email configuration:

- Development: MailHog (local SMTP)
- Production: Mailgun via Anymail

Email template is generated in notification_service.py with formatting for:

- Overdue tasks (red)
- Due today tasks (yellow)
- Coming up in 7 days (green)

## User Flow

### 1. **Initial Setup**

- When a user account is created, NotificationPreference is auto-created on first API call
- Defaults: All notifications enabled, weekly email frequency

### 2. **Daily Notification Generation**

- 6:00 AM UTC: Celery task runs `create_notifications_task()`
- For each user:
  - Gets overdue, due today, and due soon tasks
  - Creates notifications based on preferences
  - Uses unique constraint to avoid duplicates

### 3. **Weekly Email Sending**

- Monday 9:00 AM UTC: Celery task runs `send_weekly_email_notifications_task()`
- For each user:
  - Checks if weekly frequency is set
  - Gets email content
  - Sends formatted email
  - Updates last_email_sent timestamp

### 4. **User Interaction**

- User opens app and sees notification badge
- Clicks bell icon to open notification center
- Sees grouped notifications with color coding
- Can mark individual or all notifications as read
- Can access preferences page to customize settings

## API Response Examples

### Get Notifications

```json
{
  "count": 5,
  "results": [
    {
      "id": "1",
      "task": "123",
      "task_title": "Replace air filter",
      "task_due_date": "2024-01-15",
      "notification_type": "overdue",
      "title": "Overdue: Replace air filter",
      "message": "Task \"Replace air filter\" was due on January 15, 2024",
      "is_read": false,
      "created_at": "2024-01-16T12:00:00Z",
      "read_at": null
    }
  ]
}
```

### Get Notification Summary

```json
{
  "overdue": 2,
  "due_today": 1,
  "due_soon": 3,
  "total": 6
}
```

### Get Preferences

```json
{
  "id": "1",
  "email_overdue_tasks": true,
  "email_due_soon_tasks": true,
  "email_frequency": "weekly",
  "inapp_overdue_tasks": true,
  "inapp_due_soon_tasks": true,
  "last_email_sent": "2024-01-08T09:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-16T12:00:00Z"
}
```

## Key Features

### Color Coding

- 🔴 Red - Overdue tasks
- 🟡 Yellow - Due today
- 🟢 Green - Coming up (next 7 days)

### Frequency Control

- **Daily** - Receive email every day
- **Weekly** - Receive email once per week (Monday 9am UTC)
- **Never** - Don't receive email notifications

### Preference Flexibility

- Users can disable email notifications per type
- Users can disable in-app notifications per type
- In-app notifications can be toggled separately from email

### Performance Optimizations

- Unique constraint prevents duplicate notifications
- Pagination on notification listing
- 30-second polling interval for summary updates
- Efficient database queries with select_related and prefetch_related

## Testing

To test the notification system:

### 1. **Manual Testing**

```bash
# Create a test notification
python manage.py shell
from owner.notification_service import create_notifications_for_user
from django.contrib.auth import get_user_model
user = get_user_model().objects.first()
create_notifications_for_user(user)
```

### 2. **Email Testing (Development)**

- Email is sent to MailHog on port 1025
- View at http://localhost:1025

### 3. **Celery Task Testing**

```bash
# Run task immediately
celery -A backend call owner.tasks.create_notifications_task
celery -A backend call owner.tasks.send_weekly_email_notifications_task
```

## Future Enhancements

1. **Push Notifications** - Add browser/mobile push notifications
2. **SMS Alerts** - Send SMS for critical overdue tasks
3. **Custom Reminder Times** - Allow users to set custom reminder times
4. **Task-Level Preferences** - Set notification preferences per task
5. **Notification History** - Keep a longer history of sent notifications
6. **Digest Optimization** - Smart grouping and summarization
7. **Real-time Updates** - WebSocket integration for instant notifications
8. **Notification Templates** - Customizable email templates

## Troubleshooting

### Notifications not appearing

1. Check `NotificationPreference.inapp_overdue_tasks` / `inapp_due_soon_tasks`
2. Verify task due dates are correct
3. Check logs for `create_notifications_task` errors

### Emails not sending

1. Verify `NotificationPreference.email_frequency != 'never'`
2. Check email configuration in settings
3. Verify Mailgun/email backend configuration
4. Check Celery task logs

### Duplicate notifications

- Unique constraint should prevent this, but check for manually created notifications

## File Summary

### Backend Files Modified/Created

- `backend/owner/models.py` - Added Notification, NotificationPreference models
- `backend/owner/serializers.py` - Added NotificationSerializer, NotificationPreferenceSerializer
- `backend/owner/views.py` - Added NotificationViewSet, NotificationPreferenceViewSet
- `backend/owner/urls.py` - Added notification routes
- `backend/owner/tasks.py` - Added Celery tasks for notifications
- `backend/owner/notification_service.py` - NEW - Core notification logic
- `backend/owner/admin.py` - Added admin interfaces for notifications
- `backend/owner/migrations/0015_notification_notificationpreference.py` - NEW - Database migration
- `backend/backend/celery.py` - Updated task schedule

### Frontend Files Created

- `frontend/src/notifications/NotificationsService.ts` - NEW - API service
- `frontend/src/notifications/NotificationCenter.tsx` - NEW - Notification modal
- `frontend/src/notifications/NotificationPreferences.tsx` - NEW - Preferences UI
- `frontend/src/notifications/Notifications.tsx` - NEW - Main notifications page

### Frontend Files Modified

- `frontend/src/components/SideMenu.tsx` - Added notification button and route
- `frontend/src/Router.tsx` - Added notifications route
