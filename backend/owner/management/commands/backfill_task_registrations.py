"""
Django management command to backfill task registrations for existing HomeComponents.

This command will:
1. Find all existing HomeComponents that don't have task registrations
2. Check them against all active TaskTemplates
3. Create TaskRegistrations for matches
4. Generate initial tasks for the new registrations

Usage:
    python manage.py backfill_task_registrations
    python manage.py backfill_task_registrations --dry-run
    python manage.py backfill_task_registrations --user-id 123
    python manage.py backfill_task_registrations --home-id 456
"""

import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from owner.models import HomeComponent, TaskTemplate, TaskRegistration
from owner.recurring_tasks import create_tasks_from_registrations

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Backfill task registrations for existing HomeComponents'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating',
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='Backfill for a specific user only',
        )
        parser.add_argument(
            '--home-id',
            type=int,
            help='Backfill for a specific home only',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        user_id = options.get('user_id')
        home_id = options.get('home_id')

        if dry_run:
            self.stdout.write(
                self.style.WARNING('Running in dry-run mode - no changes will be made')
            )

        # Build query for HomeComponents
        components_query = HomeComponent.objects.all()

        if user_id:
            components_query = components_query.filter(user_id=user_id)
            self.stdout.write(f"Filtering to user ID: {user_id}")

        if home_id:
            components_query = components_query.filter(home_id=home_id)
            self.stdout.write(f"Filtering to home ID: {home_id}")

        # Get all active task templates
        active_templates = TaskTemplate.objects.filter(is_active=True)

        self.stdout.write(
            self.style.SUCCESS(f"Found {components_query.count()} HomeComponents")
        )
        self.stdout.write(f"Found {active_templates.count()} active TaskTemplates")

        total_matches = 0
        total_registrations_created = 0
        components_with_matches = []

        # Check each component
        for component in components_query:
            matched_templates = []

            # Find templates that match this component
            for template in active_templates:
                if template.matches_component(component):
                    matched_templates.append(template)

            if matched_templates:
                self.stdout.write(
                    self.style.SUCCESS(f"\n✓ {component.name} ({component.category})")
                )
                self.stdout.write(f"  Matched {len(matched_templates)} template(s)")

                for template in matched_templates:
                    self.stdout.write(f"    - {template.title}")
                    total_matches += 1

                    if not dry_run:
                        # Create a TaskRegistration if it doesn't already exist
                        registration, created_reg = TaskRegistration.objects.get_or_create(
                            home_component=component,
                            task_template=template,
                            defaults={
                                'user': component.user,
                                'home': component.home,
                                'frequency_months': None,  # Will use template default
                                'is_active': True,
                            }
                        )

                        if created_reg:
                            self.stdout.write(
                                self.style.SUCCESS(f"      → Created new TaskRegistration (ID: {registration.id})")
                            )
                            total_registrations_created += 1
                            components_with_matches.append(component)
                        else:
                            self.stdout.write(
                                f"      → TaskRegistration already exists (ID: {registration.id})"
                            )

        # Summary
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("BACKFILL SUMMARY"))
        self.stdout.write("="*60)
        self.stdout.write(f"Total template matches found: {total_matches}")

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"Would create: {total_matches} TaskRegistrations (dry-run mode)")
            )
        else:
            self.stdout.write(f"TaskRegistrations created: {total_registrations_created}")

            # Generate initial tasks for newly created registrations
            if total_registrations_created > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"\nGenerating initial tasks for {total_registrations_created} new registrations..."
                    )
                )

                # Get all new registrations from components we just processed
                new_registrations = TaskRegistration.objects.filter(
                    home_component__in=components_with_matches,
                    last_task_generated__isnull=True,  # Never generated a task yet
                )

                result = create_tasks_from_registrations(registrations=new_registrations)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Task generation complete: {result['created']} tasks created"
                    )
                )

                if result.get('errors'):
                    self.stdout.write(
                        self.style.ERROR(f"Encountered {len(result['errors'])} errors:")
                    )
                    for error in result['errors']:
                        self.stdout.write(
                            self.style.ERROR(f"  - {error}")
                        )
