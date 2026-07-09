from django.conf import settings
from django.db import migrations, models


def alter_month_column(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute(
            'ALTER TABLE listeners_monthlylisteningstatistic '
            'ALTER COLUMN month TYPE smallint '
            'USING EXTRACT(MONTH FROM month)::smallint;'
        )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_remove_album_name'),
        ('listeners', '0009_remove_playlist_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='monthlylisteningstatistic',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='monthlylisteningstatistic',
            name='year',
            field=models.PositiveSmallIntegerField(db_index=True, default=1),
            preserve_default=False,
        ),

        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name='monthlylisteningstatistic',
                    name='month',
                    field=models.PositiveSmallIntegerField(),
                ),
            ],
            database_operations=[
                migrations.RunPython(alter_month_column, reverse_noop),
            ],
        ),

        migrations.AlterUniqueTogether(
            name='monthlylisteningstatistic',
            unique_together={('listener', 'track', 'month', 'year')},
        ),
    ]