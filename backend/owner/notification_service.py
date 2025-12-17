"""
Notification service for managing and sending notifications
"""
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from .models import Task, Notification, NotificationPreference
from django.db.models import Q

User = get_user_model()


def get_upcoming_and_overdue_tasks(user):
    """
    Get upcoming tasks (next 7 days) and overdue tasks for a user

    Returns:
        dict: Contains 'overdue', 'due_today', 'due_soon' lists
    """
    today = timezone.now().date()
    next_week = today + timedelta(days=7)

    # Get all non-completed tasks for the user
    all_tasks = Task.objects.filter(
        user=user,
        status__in=['pending', 'in-progress']
    ).order_by('due_date')

    overdue_tasks = all_tasks.filter(due_date__lt=today)
    due_today_tasks = all_tasks.filter(due_date=today)
    due_soon_tasks = all_tasks.filter(due_date__gt=today, due_date__lte=next_week)

    return {
        'overdue': list(overdue_tasks),
        'due_today': list(due_today_tasks),
        'due_soon': list(due_soon_tasks),
    }


def create_notifications_for_user(user):
    """
    Create in-app notifications for a user based on their tasks

    Args:
        user: The user object

    Returns:
        dict: Count of created notifications by type
    """
    tasks_data = get_upcoming_and_overdue_tasks(user)
    created_counts = {
        'overdue': 0,
        'due_today': 0,
        'due_soon': 0,
    }

    # Get or create notification preferences
    pref, _ = NotificationPreference.objects.get_or_create(user=user)

    # Create overdue notifications if enabled
    if pref.inapp_overdue_tasks:
        for task in tasks_data['overdue']:
            notification, created = Notification.objects.get_or_create(
                user=user,
                task=task,
                notification_type='overdue',
                defaults={
                    'title': f'Overdue: {task.title}',
                    'message': f'Task "{task.title}" was due on {task.due_date.strftime("%B %d, %Y")}',
                }
            )
            if created:
                created_counts['overdue'] += 1

    # Create due today notifications if enabled
    if pref.inapp_due_soon_tasks:
        for task in tasks_data['due_today']:
            notification, created = Notification.objects.get_or_create(
                user=user,
                task=task,
                notification_type='due_today',
                defaults={
                    'title': f'Due Today: {task.title}',
                    'message': f'Task "{task.title}" is due today!',
                }
            )
            if created:
                created_counts['due_today'] += 1

    # Create due soon notifications if enabled
    if pref.inapp_due_soon_tasks:
        for task in tasks_data['due_soon']:
            notification, created = Notification.objects.get_or_create(
                user=user,
                task=task,
                notification_type='due_soon',
                defaults={
                    'title': f'Coming Up: {task.title}',
                    'message': f'Task "{task.title}" is due on {task.due_date.strftime("%B %d, %Y")}',
                }
            )
            if created:
                created_counts['due_soon'] += 1

    return created_counts


def should_send_email_notification(user):
    """
    Check if a user should receive email notifications based on their preferences and frequency

    Args:
        user: The user object

    Returns:
        bool: True if email should be sent
    """
    pref, _ = NotificationPreference.objects.get_or_create(user=user)

    # If emails are disabled, don't send
    if not pref.email_overdue_tasks and not pref.email_due_soon_tasks:
        return False

    # If frequency is set to never, don't send
    if pref.email_frequency == 'never':
        return False

    # Check last email sent based on frequency
    now = timezone.now()

    if pref.email_frequency == 'daily':
        if pref.last_email_sent:
            last_sent = pref.last_email_sent
            if (now - last_sent).days < 1:
                return False
    elif pref.email_frequency == 'weekly':
        if pref.last_email_sent:
            last_sent = pref.last_email_sent
            if (now - last_sent).days < 7:
                return False

    return True


def get_email_notification_content(user):
    """
    Get the content for an email notification (HTML formatted)

    Args:
        user: The user object

    Returns:
        dict: Contains 'subject', 'html_message', 'tasks_data'
    """
    pref, _ = NotificationPreference.objects.get_or_create(user=user)
    tasks_data = get_upcoming_and_overdue_tasks(user)

    # Filter based on preferences
    if not pref.email_overdue_tasks:
        tasks_data['overdue'] = []
    if not pref.email_due_soon_tasks:
        tasks_data['due_today'] = []
        tasks_data['due_soon'] = []

    # Only include non-empty categories
    has_content = any([tasks_data['overdue'], tasks_data['due_today'], tasks_data['due_soon']])

    if not has_content:
        return None

    subject = "Your Weekly Home Maintenance Reminder"

    # Build HTML email
    user_name = user.first_name or user.email.split('@')[0]

    html_message = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .greeting {{
                font-size: 16px;
                margin-bottom: 20px;
            }}
            .task-section {{
                margin-bottom: 25px;
            }}
            .task-section h2 {{
                font-size: 18px;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            .overdue h2 {{
                color: #dc2626;
            }}
            .due-today h2 {{
                color: #ea580c;
            }}
            .due-soon h2 {{
                color: #16a34a;
            }}
            .task-list {{
                list-style: none;
                padding: 0;
                margin: 0;
            }}
            .task-item {{
                background-color: #f9fafb;
                border-left: 4px solid #e5e7eb;
                padding: 12px 15px;
                margin-bottom: 10px;
                border-radius: 4px;
            }}
            .overdue .task-item {{
                border-left-color: #dc2626;
                background-color: #fef2f2;
            }}
            .due-today .task-item {{
                border-left-color: #ea580c;
                background-color: #fffbf0;
            }}
            .due-soon .task-item {{
                border-left-color: #16a34a;
                background-color: #f0fdf4;
            }}
            .task-title {{
                font-weight: 600;
                color: #1f2937;
            }}
            .task-date {{
                font-size: 14px;
                color: #6b7280;
                margin-top: 5px;
            }}
            .cta {{
                text-align: center;
                margin: 30px 0;
            }}
            .cta-button {{
                display: inline-block;
                background-color: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                transition: background-color 0.2s;
            }}
            .cta-button:hover {{
                background-color: #5568d3;
            }}
            .footer {{
                background-color: #f3f4f6;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
            }}
            .footer-text {{
                margin: 5px 0;
            }}
            .empty-message {{
                text-align: center;
                color: #6b7280;
                padding: 20px;
                font-style: italic;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 Homedex Home Maintenance</h1>
                <p style="margin: 10px 0 0 0;">Weekly Task Reminder</p>
            </div>

            <div class="content">
                <div class="greeting">
                    <p>Hi {user_name},</p>
                    <p>Here's your weekly update on home maintenance tasks. Stay on top of your home care!</p>
                </div>
    """

    # Overdue tasks
    if tasks_data['overdue']:
        html_message += f"""
                <div class="task-section overdue">
                    <h2>🔴 Overdue Tasks ({len(tasks_data['overdue'])})</h2>
                    <ul class="task-list">
        """
        for task in tasks_data['overdue']:
            days_overdue = (timezone.now().date() - task.due_date).days
            html_message += f"""
                        <li class="task-item">
                            <div class="task-title">{task.title}</div>
                            <div class="task-date">Due: {task.due_date.strftime('%B %d, %Y')} ({days_overdue} days ago)</div>
                        </li>
            """
        html_message += """
                    </ul>
                </div>
        """

    # Due today
    if tasks_data['due_today']:
        html_message += f"""
                <div class="task-section due-today">
                    <h2>🟡 Due Today ({len(tasks_data['due_today'])})</h2>
                    <ul class="task-list">
        """
        for task in tasks_data['due_today']:
            html_message += f"""
                        <li class="task-item">
                            <div class="task-title">{task.title}</div>
                            <div class="task-date">Today!</div>
                        </li>
            """
        html_message += """
                    </ul>
                </div>
        """

    # Due soon
    if tasks_data['due_soon']:
        html_message += f"""
                <div class="task-section due-soon">
                    <h2>🟢 Coming Up in Next 7 Days ({len(tasks_data['due_soon'])})</h2>
                    <ul class="task-list">
        """
        for task in tasks_data['due_soon']:
            days_until = (task.due_date - timezone.now().date()).days
            html_message += f"""
                        <li class="task-item">
                            <div class="task-title">{task.title}</div>
                            <div class="task-date">Due: {task.due_date.strftime('%B %d, %Y')} (in {days_until} days)</div>
                        </li>
            """
        html_message += """
                    </ul>
                </div>
        """

    html_message += """
                <div class="cta">
                    <a href="https://app.homedex.app/account/notifications" class="cta-button">View All Tasks</a>
                </div>

                <p style="color: #6b7280; font-size: 14px;">
                    Keep your home in great shape by staying on top of maintenance tasks. Log in to Homedex anytime to update task statuses, add notes, or create new tasks.
                </p>
            </div>

            <div class="footer">
                <p class="footer-text">© 2025 Homedex. All rights reserved.</p>
                <p class="footer-text">Made with ❤️ in Boston</p>
                <p class="footer-text">
                    <a href="https://app.homedex.app/account/notifications" style="color: #667eea; text-decoration: none;">Manage Notification Preferences</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    return {
        'subject': subject,
        'html_message': html_message,
        'tasks_data': tasks_data,
    }
def update_email_sent_timestamp(user):
    """
    Update the last_email_sent timestamp for a user

    Args:
        user: The user object
    """
    pref, _ = NotificationPreference.objects.get_or_create(user=user)
    pref.last_email_sent = timezone.now()
    pref.save()
