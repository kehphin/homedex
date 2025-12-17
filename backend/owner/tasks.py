"""
Celery tasks for the owner app
"""
from celery import shared_task
from .recurring_tasks import create_recurring_task_instances


@shared_task
def create_recurring_task_instances_task():
    """
    Celery task to create recurring task instances.
    Scheduled to run daily at 12:00 AM UTC.
    """
    result = create_recurring_task_instances(dry_run=False)
    return result
