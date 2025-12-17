"""
Celery configuration for Homedex backend
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Load configuration from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


# Configure Celery Beat schedule
app.conf.beat_schedule = {
    'create-recurring-task-instances': {
        'task': 'owner.tasks.create_recurring_task_instances_task',
        'schedule': crontab(hour=0, minute=0),  # Every day at 12:00 AM UTC
    },
}

# Timezone for Celery Beat
app.conf.timezone = 'UTC'
