from django.db import models
from django.conf import settings

class Playlist(models.Model):
    name = models.CharField(max_length=100)
    listener = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

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
    month = models.DateField(db_index=True)

    class Meta:
        unique_together = ('listener', 'track', 'month')

    def __str__(self):
        minutes = self.seconds_listened // 60
        return f"{self.listener.username} - {self.track.title} ({self.month.strftime('%B %Y')}): {minutes} min"