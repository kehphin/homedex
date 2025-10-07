from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("djstripe", "0012_2_8"),
        ('payments', '0004_usercustomer_created_at_alter_usercustomer_customer_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE djstripe_paymentintent ALTER COLUMN capture_method TYPE varchar(255);"
        ),
    ]