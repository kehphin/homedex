# Generated migration for Notification and NotificationPreference models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('owner', '0014_task_recurrence_days_of_month_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('overdue', 'Overdue Task'), ('due_today', 'Due Today'), ('due_soon', 'Due Soon (Next 7 Days)')], max_length=20)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='owner.task')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='NotificationPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email_overdue_tasks', models.BooleanField(default=True)),
                ('email_due_soon_tasks', models.BooleanField(default=True)),
                ('email_frequency', models.CharField(choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('never', 'Never')], default='weekly', help_text='How often to send email notifications', max_length=20)),
                ('inapp_overdue_tasks', models.BooleanField(default=True)),
                ('inapp_due_soon_tasks', models.BooleanField(default=True)),
                ('last_email_sent', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='notification_preference', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='notification',
            constraint=models.UniqueConstraint(fields=['user', 'task', 'notification_type'], name='unique_user_task_notification'),
        ),
    ]
