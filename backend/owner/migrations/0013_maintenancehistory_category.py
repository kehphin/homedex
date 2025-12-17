# Generated migration for adding category field to MaintenanceHistory

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('owner', '0012_componentimage_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='maintenancehistory',
            name='category',
            field=models.CharField(
                blank=True,
                choices=[('Regular maintenance', 'Regular maintenance'), ('Repair', 'Repair')],
                max_length=50
            ),
        ),
    ]
