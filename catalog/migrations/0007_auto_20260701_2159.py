
from django.db import migrations


def seed_users_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0006_merge_20260701_1800'),
    ]
    operations = [
        migrations.RunPython(seed_users_noop, migrations.RunPython.noop),
    ]