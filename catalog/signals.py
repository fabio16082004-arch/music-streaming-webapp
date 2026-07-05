from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from catalog.models import Artist, Track, Album


#necessary to clean up tracks without artists
@receiver(post_delete, sender=Artist)
def cleanup_orphaned_resources(sender, instance, **kwargs):
    with transaction.atomic():
        Track.objects.filter(artists__isnull=True).delete()
        Album.objects.filter(artists__isnull=True).delete()