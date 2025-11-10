"""
Utilities for handling recurring tasks.
This module manages automatic creation and email notifications for recurring tasks.
"""

from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import Task, RecurringTaskInstance


def calculate_next_due_date(current_due_date, recurrence_pattern, recurrence_interval):
    """
    Calculate the next due date based on recurrence pattern and interval.

    Args:
        current_due_date: datetime.date object of the current task
        recurrence_pattern: 'daily', 'weekly', 'monthly', or 'yearly'
        recurrence_interval: Number of periods between recurrences

    Returns:
        datetime.date object for the next due date
    """
    current = current_due_date

    if recurrence_pattern == 'daily':
        return current + timedelta(days=recurrence_interval)
    elif recurrence_pattern == 'weekly':
        return current + timedelta(weeks=recurrence_interval)
    elif recurrence_pattern == 'monthly':
        # Add months by calculating the month offset
        month = current.month + recurrence_interval
        year = current.year

        while month > 12:
            month -= 12
            year += 1

        # Handle day overflow (e.g., Jan 31 + 1 month)
        max_day = (datetime(year, month % 12 or 12, 1) - timedelta(days=1)).day
        day = min(current.day, max_day)

        return datetime(year, month, day).date()
    elif recurrence_pattern == 'yearly':
        return current.replace(year=current.year + recurrence_interval)

    return current


def create_recurring_task_instances(dry_run=False):
    """
    Create instances of recurring tasks that are due.
    This should be called by a scheduled task (celery beat or cron job).

    Args:
        dry_run: If True, only report what would be created without creating

    Returns:
        dict with 'created' count and 'errors' list
    """
    today = timezone.now().date()
    result = {'created': 0, 'errors': []}

    # Find all recurring tasks
    recurring_tasks = Task.objects.filter(is_recurring=True, parent_task__isnull=True)

    for task in recurring_tasks:
        try:
            # Find the latest instance of this recurring task
            latest_instance = RecurringTaskInstance.objects.filter(
                recurring_task=task
            ).select_related('instance_task').order_by('-instance_task__due_date').first()

            # Determine the next due date
            if latest_instance:
                last_due_date = latest_instance.instance_task.due_date
                next_due_date = calculate_next_due_date(
                    last_due_date,
                    task.recurrence_pattern,
                    task.recurrence_interval
                )
            else:
                # First instance - use the task's original due date
                next_due_date = task.due_date

            # Check if we should create a new instance
            should_create = False

            if next_due_date <= today:
                # Check if recurrence should end
                if task.recurrence_end_date is None or next_due_date <= task.recurrence_end_date:
                    should_create = True

            if should_create:
                if not dry_run:
                    # Create new task instance
                    new_task = Task.objects.create(
                        user=task.user,
                        title=task.title,
                        description=task.description,
                        category=task.category,
                        priority=task.priority,
                        status='pending',
                        due_date=next_due_date,
                        is_recurring=False,
                        parent_task=task
                    )

                    # Create tracking record
                    RecurringTaskInstance.objects.create(
                        recurring_task=task,
                        instance_task=new_task
                    )

                    result['created'] += 1

                    # Send email notification
                    send_recurring_task_email(task.user, new_task)
                else:
                    result['created'] += 1

        except Exception as e:
            result['errors'].append({
                'task_id': task.id,
                'task_title': task.title,
                'error': str(e)
            })

    return result


def send_recurring_task_email(user, task):
    """
    Send an email notification to the user about a newly created recurring task.

    Args:
        user: User object
        task: Task object (the newly created instance)
    """
    try:
        if not user.email:
            return

        subject = f"New Task: {task.title}"

        message = f"""
Hi {user.first_name or user.username},

A new task has been automatically created from your recurring task schedule:

Task: {task.title}
Category: {task.category}
Priority: {task.priority}
Due Date: {task.due_date.strftime('%B %d, %Y')}

Description:
{task.description if task.description else 'No description provided'}

You can view and manage this task in your Homedex dashboard.

Best regards,
The Homedex Team
        """

        html_message = f"""
<html>
    <body>
        <p>Hi {user.first_name or user.username},</p>
        <p>A new task has been automatically created from your recurring task schedule:</p>

        <div style="border-left: 4px solid #007bff; padding-left: 15px; margin: 20px 0;">
            <p><strong>Task:</strong> {task.title}</p>
            <p><strong>Category:</strong> {task.category}</p>
            <p><strong>Priority:</strong> <span style="text-transform: capitalize;">{task.priority}</span></p>
            <p><strong>Due Date:</strong> {task.due_date.strftime('%B %d, %Y')}</p>

            {f'<p><strong>Description:</strong></p><p>{task.description}</p>' if task.description else ''}
        </div>

        <p>You can view and manage this task in your <a href="https://app.homedex.app/tasks">Homedex dashboard</a>.</p>

        <p>Best regards,<br>The Homedex Team</p>
    </body>
</html>
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=True
        )
    except Exception as e:
        print(f"Error sending email for task {task.id}: {str(e)}")


def get_recurring_task_stats(user):
    """
    Get statistics about recurring tasks for a user.

    Args:
        user: User object

    Returns:
        dict with recurring task statistics
    """
    recurring_tasks = Task.objects.filter(user=user, is_recurring=True, parent_task__isnull=True)

    active_count = recurring_tasks.filter(
        recurrence_end_date__isnull=True
    ) | recurring_tasks.filter(
        recurrence_end_date__gte=timezone.now().date()
    )

    return {
        'total_recurring': recurring_tasks.count(),
        'active_recurring': active_count.count(),
        'inactive_recurring': recurring_tasks.count() - active_count.count(),
    }
