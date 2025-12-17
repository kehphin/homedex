"""
Celery tasks for the owner app
"""
from celery import shared_task
from .recurring_tasks import create_recurring_task_instances
from .notification_service import (
    create_notifications_for_user,
    should_send_email_notification,
    get_email_notification_content,
    update_email_sent_timestamp
)
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()


@shared_task
def create_recurring_task_instances_task():
    """
    Celery task to create recurring task instances.
    Scheduled to run daily at 12:00 AM UTC.
    """
    result = create_recurring_task_instances(dry_run=False)
    return result


@shared_task
def create_notifications_task():
    """
    Celery task to create in-app notifications for all users.
    Scheduled to run daily.
    """
    users = User.objects.all()
    total_created = {
        'overdue': 0,
        'due_today': 0,
        'due_soon': 0,
    }

    for user in users:
        try:
            counts = create_notifications_for_user(user)
            total_created['overdue'] += counts['overdue']
            total_created['due_today'] += counts['due_today']
            total_created['due_soon'] += counts['due_soon']
        except Exception as e:
            print(f"Error creating notifications for user {user.email}: {str(e)}")

    return total_created


@shared_task
def send_weekly_email_notifications_task():
    """
    Celery task to send weekly email notifications to users.
    Scheduled to run weekly (e.g., Monday at 9:00 AM UTC).
    """
    users = User.objects.all()
    sent_count = 0
    error_count = 0

    for user in users:
        try:
            if should_send_email_notification(user):
                email_content = get_email_notification_content(user)

                if email_content:
                    send_mail(
                        subject=email_content['subject'],
                        message="",  # Plain text fallback (empty since we're using HTML)
                        html_message=email_content['html_message'],
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    update_email_sent_timestamp(user)
                    sent_count += 1
        except Exception as e:
            print(f"Error sending email to user {user.email}: {str(e)}")
            error_count += 1

    return {
        'sent_count': sent_count,
        'error_count': error_count,
    }
