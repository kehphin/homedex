import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import HomeComponent, TaskTemplate, TaskRegistration
from .recurring_tasks import create_tasks_from_registrations

logger = logging.getLogger(__name__)


@receiver(post_save, sender=HomeComponent)
def create_task_registrations(sender, instance, created, **kwargs):
    """
    When a HomeComponent is created, find all matching TaskTemplates
    and create TaskRegistration records for them. Then immediately generate
    any tasks that are due.
    """
    if not created:
        # Only run on creation, not on update
        return

    logger.info(f"Creating task registrations for HomeComponent: {instance.name} ({instance.category})")

    # Get all active task templates
    active_templates = TaskTemplate.objects.filter(is_active=True)

    created_registrations = []
    matched_count = 0

    # Find templates that match this component
    for template in active_templates:
        if template.matches_component(instance):
            matched_count += 1
            logger.info(f"  ✓ Matched template: {template.title}")

            # Create a TaskRegistration if it doesn't already exist
            registration, created_reg = TaskRegistration.objects.get_or_create(
                home_component=instance,
                task_template=template,
                defaults={
                    'user': instance.user,
                    'frequency_months': None,  # Will use template default
                    'is_active': True,
                }
            )

            if created_reg:
                logger.info(f"    → Created new TaskRegistration (ID: {registration.id})")
                created_registrations.append(registration)
            else:
                logger.info(f"    → TaskRegistration already exists (ID: {registration.id})")

    if matched_count == 0:
        logger.info(f"  No matching templates found for {instance.name}")
    else:
        logger.info(f"Total matches: {matched_count} templates")

    # Immediately generate tasks for newly created registrations
    if created_registrations:
        logger.info(f"Generating initial tasks for {len(created_registrations)} new registrations")
        result = create_tasks_from_registrations(
            registrations=TaskRegistration.objects.filter(id__in=[r.id for r in created_registrations])
        )
        logger.info(f"Task generation result: {result}")


