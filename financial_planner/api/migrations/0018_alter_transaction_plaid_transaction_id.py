from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_plaiditem_cursor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='plaid_transaction_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
