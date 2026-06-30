from django.db import models
from django.conf import settings

class Playlist(models.Model):
    title = models.CharField(max_length=100, default='New playlist')
    listener = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    saved_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='saved_playlists',
        blank=True)

    tracks = models.ManyToManyField('catalog.Track', blank=True, related_name='playlists')
    is_public = models.BooleanField(default=False)


class MonthlyListeningStatistic(models.Model):
    listener = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='monthly_statistics'
    )
    track = models.ForeignKey(
        'catalog.Track',
        on_delete=models.CASCADE,
        related_name='listening_statistics'
    )
    seconds_listened = models.IntegerField(default=0)

    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField(db_index=True)

    class Meta:
        unique_together = ('listener', 'track', 'month', 'year')


