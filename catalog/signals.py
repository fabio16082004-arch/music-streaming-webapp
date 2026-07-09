from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from catalog.models import Artist, Track, Album
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Track, Album


#logic that delete an audio or an image file in the database when a track or an album is removed
def _delete_file_field(field_file):
    if not field_file:
        return
    try:
        field_file.storage.delete(field_file.name)
    except Exception:
        pass


@receiver(post_delete, sender=Track)
def delete_track_files(sender, instance, **kwargs):
    _delete_file_field(instance.audio_file)
    _delete_file_field(instance.single_cover)


@receiver(post_delete, sender=Album)
def delete_album_files(sender, instance, **kwargs):
    _delete_file_field(instance.cover_file)

#necessary to clean up tracks without artists
@receiver(post_delete, sender=Artist)
def cleanup_orphaned_resources(sender, instance, **kwargs):
    with transaction.atomic():
        Track.objects.filter(artists__isnull=True).delete()
        Album.objects.filter(artists__isnull=True).delete()