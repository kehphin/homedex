"""
Django management command to create instances of recurring tasks.
This should be scheduled to run periodically (e.g., daily via cron or Celery Beat).

Usage:
    python manage.py create_recurring_task_instances
    python manage.py create_recurring_task_instances --dry-run
"""

from django.core.management.base import BaseCommand
from owner.recurring_tasks import create_recurring_task_instances


class Command(BaseCommand):
    help = 'Create instances of recurring tasks that are due'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)

        if dry_run:
            self.stdout.write(
                self.style.WARNING('Running in dry-run mode - no changes will be made')
            )

        result = create_recurring_task_instances(dry_run=dry_run)

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {result['created']} recurring task instances")
        )

        if result['errors']:
            self.stdout.write(
                self.style.ERROR(f"Encountered {len(result['errors'])} errors:")
            )
            for error in result['errors']:
                self.stdout.write(
                    self.style.ERROR(
                        f"  - Task {error['task_id']} ({error['task_title']}): {error['error']}"
                    )
                )
