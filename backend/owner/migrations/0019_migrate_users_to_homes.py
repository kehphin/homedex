# Generated data migration to move existing user-based data to Home model

from django.db import migrations


def migrate_users_to_homes(apps, schema_editor):
    """
    For each user with a HomeProfile:
    1. Create a Home with the profile data
    2. Create a HomeMembership linking the user to the home
    3. Create a UserHomeContext setting the home as current
    4. Update all related records (components, documents, tasks, etc.) to point to the new home
    """
    User = apps.get_model('auth', 'User')
    HomeProfile = apps.get_model('owner', 'HomeProfile')
    Home = apps.get_model('owner', 'Home')
    HomeMembership = apps.get_model('owner', 'HomeMembership')
    UserHomeContext = apps.get_model('owner', 'UserHomeContext')

    # Models to migrate
    HomeLocation = apps.get_model('owner', 'HomeLocation')
    HomeComponent = apps.get_model('owner', 'HomeComponent')
    Document = apps.get_model('owner', 'Document')
    Task = apps.get_model('owner', 'Task')
    TaskRegistration = apps.get_model('owner', 'TaskRegistration')
    Appointment = apps.get_model('owner', 'Appointment')
    Contractor = apps.get_model('owner', 'Contractor')
    MaintenanceHistory = apps.get_model('owner', 'MaintenanceHistory')

    for user in User.objects.all():
        try:
            profile = HomeProfile.objects.get(user=user)

            # Create Home from HomeProfile
            home = Home.objects.create(
                name=f"{user.email}'s Home",
                address=profile.address,
                city=profile.city or '',
                state=profile.state or '',
                zip_code=profile.zip_code or '',
                square_feet=profile.square_feet,
                bedrooms=profile.bedrooms,
                bathrooms=profile.bathrooms,
                ac=profile.ac,
                ac_type=profile.ac_type or '',
                heat=profile.heat,
                heat_type=profile.heat_type or '',
                heating_source=profile.heating_source or '',
                is_septic=profile.is_septic,
                year_built=profile.year_built,
                is_active=True
            )

            # Create HomeMembership
            HomeMembership.objects.create(
                user=user,
                home=home,
                role='owner',
                is_primary=True
            )

            # Create UserHomeContext
            UserHomeContext.objects.create(
                user=user,
                current_home=home
            )

            # Migrate all related records
            HomeLocation.objects.filter(user=user).update(home=home)
            HomeComponent.objects.filter(user=user).update(home=home)
            Document.objects.filter(user=user).update(home=home)
            Task.objects.filter(user=user).update(home=home)
            TaskRegistration.objects.filter(user=user).update(home=home)
            Appointment.objects.filter(user=user).update(home=home)
            Contractor.objects.filter(user=user).update(home=home)
            MaintenanceHistory.objects.filter(user=user).update(home=home)

            print(f"✓ Migrated user {user.email} to home '{home.name}'")

        except HomeProfile.DoesNotExist:
            # User has no profile yet - skip
            print(f"⊘ User {user.email} has no home profile - skipping")
            continue


def reverse_migration(apps, schema_editor):
    """
    Reverse the migration by copying home back to user
    """
    HomeMembership = apps.get_model('owner', 'HomeMembership')

    # Models to reverse
    HomeLocation = apps.get_model('owner', 'HomeLocation')
    HomeComponent = apps.get_model('owner', 'HomeComponent')
    Document = apps.get_model('owner', 'Document')
    Task = apps.get_model('owner', 'Task')
    TaskRegistration = apps.get_model('owner', 'TaskRegistration')
    Appointment = apps.get_model('owner', 'Appointment')
    Contractor = apps.get_model('owner', 'Contractor')
    MaintenanceHistory = apps.get_model('owner', 'MaintenanceHistory')

    for membership in HomeMembership.objects.all():
        user = membership.user
        home = membership.home

        # Reverse migrate all records
        HomeLocation.objects.filter(home=home).update(user=user)
        HomeComponent.objects.filter(home=home).update(user=user)
        Document.objects.filter(home=home).update(user=user)
        Task.objects.filter(home=home).update(user=user)
        TaskRegistration.objects.filter(home=home).update(user=user)
        Appointment.objects.filter(home=home).update(user=user)
        Contractor.objects.filter(home=home).update(user=user)
        MaintenanceHistory.objects.filter(home=home).update(user=user)


class Migration(migrations.Migration):

    dependencies = [
        ('owner', '0018_add_home_models_and_fields'),
    ]

    operations = [
        migrations.RunPython(migrate_users_to_homes, reverse_migration),
    ]
