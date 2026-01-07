"""
Utilities for handling recurring tasks.
This module manages automatic creation and email notifications for recurring tasks.
"""

from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import Task, RecurringTaskInstance


def get_next_weekday(current_date, target_day_of_week):
    """
    Get the next occurrence of a specific day of the week.

    Args:
        current_date: datetime.date object
        target_day_of_week: 0-6 (0=Sunday, 6=Saturday)

    Returns:
        datetime.date object for the next occurrence
    """
    current_dow = current_date.weekday()
    # Convert Django weekday (0=Monday) to standard weekday (0=Sunday)
    django_target = (target_day_of_week + 6) % 7

    days_ahead = django_target - current_dow
    if days_ahead <= 0:  # Target day already happened this week
        days_ahead += 7

    return current_date + timedelta(days=days_ahead)


def get_relative_day_of_month(year, month, week, day_name):
    """
    Get the specific date for a relative monthly pattern.

    Args:
        year: int
        month: int (1-12)
        week: str ('first', 'second', 'third', 'fourth', 'fifth', 'last')
        day_name: str ('day', 'Sunday', 'Monday', ..., 'Saturday')

    Returns:
        datetime.date object or None if invalid
    """
    from calendar import monthcalendar, monthrange

    # Get the calendar for the month
    cal = monthcalendar(year, month)

    if day_name == 'day':
        # Find the Nth day of the month (1st, 2nd, etc.)
        week_map = {'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4, 'last': -1}
        week_index = week_map.get(week)

        if week_index is None:
            return None

        # Get all days of the month
        days = [day for week_cal in cal for day in week_cal if day != 0]

        try:
            if week_index == -1:
                target_day = days[-1]
            else:
                target_day = days[week_index]
            return datetime(year, month, target_day).date()
        except IndexError:
            return None
    else:
        # Find the Nth occurrence of a specific weekday
        day_map = {'Sunday': 6, 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2,
                   'Thursday': 3, 'Friday': 4, 'Saturday': 5}
        target_weekday = day_map.get(day_name)

        if target_weekday is None:
            return None

        week_map = {'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4, 'last': -1}
        week_index = week_map.get(week)

        if week_index is None:
            return None

        # Find all occurrences of the target weekday in this month
        occurrences = []
        for week_cal in cal:
            # week_cal is [Monday, Tuesday, ..., Sunday]
            # We need to map to standard weekday (0=Sunday)
            for day_idx, day in enumerate(week_cal):
                if day == 0:
                    continue
                django_dow = day_idx
                standard_dow = (django_dow + 1) % 7

                if standard_dow == target_weekday:
                    occurrences.append(day)

        if not occurrences:
            return None

        try:
            if week_index == -1:
                target_day = occurrences[-1]
            else:
                target_day = occurrences[week_index]
            return datetime(year, month, target_day).date()
        except IndexError:
            return None


def calculate_next_due_date(task):
    """
    Calculate the next due date based on recurrence pattern and task configuration.

    Args:
        task: Task object with recurrence settings

    Returns:
        datetime.date object for the next due date, or None if recurrence should stop
    """
    today = timezone.now().date()

    # Find the latest instance of this recurring task
    latest_instance = RecurringTaskInstance.objects.filter(
        recurring_task=task
    ).select_related('instance_task').order_by('-instance_task__due_date').first()

    if latest_instance:
        current_date = latest_instance.instance_task.due_date
    else:
        current_date = task.due_date

    # Start from tomorrow or later
    candidate_date = current_date + timedelta(days=1)

    if task.recurrence_pattern == 'daily':
        # Add the interval
        return candidate_date + timedelta(days=task.recurrence_interval - 1)

    elif task.recurrence_pattern == 'weekly':
        # Find the next occurrence of the selected days
        days_of_week = task.recurrence_days_of_week or []

        if not days_of_week:
            # Fallback to current day of week if none specified
            days_of_week = [(current_date.weekday() + 1) % 7]  # Convert Django weekday to standard

        # Convert to standard weekday format if needed
        days_of_week = [int(d) for d in days_of_week]

        # Find the next matching day
        search_date = candidate_date
        weeks_searched = 0
        max_weeks = (task.recurrence_interval or 1) * 2 + 2

        while weeks_searched < max_weeks:
            django_dow = search_date.weekday()
            standard_dow = (django_dow + 1) % 7

            if standard_dow in days_of_week:
                # Check if this is the right week (interval)
                if latest_instance:
                    # Calculate weeks difference
                    days_diff = (search_date - current_date).days
                    if days_diff > 0 and days_diff % (7 * (task.recurrence_interval or 1)) < 7:
                        return search_date
                else:
                    return search_date

            search_date += timedelta(days=1)
            if search_date.weekday() == (current_date.weekday()):
                weeks_searched += 1

        # Fallback - return the first matching day of the interval
        for i in range(7 * (task.recurrence_interval or 1)):
            check_date = candidate_date + timedelta(days=i)
            standard_dow = (check_date.weekday() + 1) % 7
            if standard_dow in days_of_week:
                return check_date

        return candidate_date

    elif task.recurrence_pattern == 'monthly':
        days_of_month = task.recurrence_days_of_month or []

        if not days_of_month:
            # Fallback to current day of month if none specified
            days_of_month = [current_date.day]

        search_date = candidate_date

        for _ in range(365):  # Search up to a year
            current_month_start = datetime(search_date.year, search_date.month, 1).date()

            if isinstance(days_of_month[0], dict):
                # Relative pattern: {"type": "relative", "week": "first", "day": "Monday"}
                pattern = days_of_month[0]
                target_date = get_relative_day_of_month(
                    search_date.year,
                    search_date.month,
                    pattern.get('week', 'first'),
                    pattern.get('day', 'day')
                )

                if target_date and target_date >= search_date:
                    return target_date
            else:
                # Absolute pattern: list of days [1, 15, 20]
                for day in days_of_month:
                    try:
                        target_date = datetime(search_date.year, search_date.month, int(day)).date()
                        if target_date >= search_date:
                            return target_date
                    except ValueError:
                        # Invalid day for this month (e.g., Feb 30)
                        continue

            # Move to next month
            if search_date.month == 12:
                search_date = datetime(search_date.year + 1, 1, 1).date()
            else:
                search_date = datetime(search_date.year, search_date.month + 1, 1).date()

        return candidate_date

    elif task.recurrence_pattern == 'yearly':
        # Add years
        try:
            return current_date.replace(year=current_date.year + task.recurrence_interval)
        except ValueError:
            # Handle leap year edge case (Feb 29)
            return current_date.replace(year=current_date.year + task.recurrence_interval, day=28)

    return candidate_date



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
            # Calculate the next due date based on the task's recurrence settings
            next_due_date = calculate_next_due_date(task)

            if next_due_date is None:
                continue

            # Check if we should create a new instance
            should_create = False

            if next_due_date <= today:
                # Check if recurrence should end
                if task.recurrence_end_date is None or next_due_date <= task.recurrence_end_date:
                    should_create = True

            if should_create:
                if not dry_run:
                    # Dismiss previous active tasks of the same parent task
                    previous_instances = Task.objects.filter(
                        parent_task=task,
                        status__in=['pending', 'in-progress']
                    )
                    previous_instances.update(status='dismissed')

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
