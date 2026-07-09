
from django.conf import settings
from django.db import migrations, models


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

        migrations.RunSQL(
            sql=(
                'ALTER TABLE listeners_monthlylisteningstatistic '
                'ALTER COLUMN month TYPE smallint '
                'USING EXTRACT(MONTH FROM month)::smallint;'
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AlterUniqueTogether(
            name='monthlylisteningstatistic',
            unique_together={('listener', 'track', 'month', 'year')},
        ),
    ]