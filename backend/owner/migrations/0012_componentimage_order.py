# Generated migration for adding order field to ComponentImage

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('owner', '0011_homelocation_homecomponent_location_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='componentimage',
            name='order',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterModelOptions(
            name='componentimage',
            options={'ordering': ['order', 'uploaded_at']},
        ),
    ]
