import os
import uuid

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models


def track_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return os.path.join('catalog', 'tracks', f"{uuid.uuid4()}.{ext}")


def track_cover_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return os.path.join('catalog', 'covers', 'track', f"{uuid.uuid4()}.{ext}")


def album_cover_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return os.path.join('catalog', 'covers', 'album', f"{uuid.uuid4()}.{ext}")


class Artist(models.Model):
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    stage_name = models.CharField(max_length=100, unique=True)
    biography = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.stage_name


class Genre(models.Model):
    name = models.CharField(max_length=100)


class Track(models.Model):
    title = models.CharField(max_length=100)
    duration = models.IntegerField()
    explicit = models.BooleanField()
    audio_file = models.FileField(upload_to=track_upload_path, max_length=500)

    single_cover = models.ImageField(upload_to=track_cover_upload_path, blank=True, null=True)
    release_date = models.DateField()

    albums = models.ManyToManyField('Album', blank=True, related_name='tracks', through='AlbumTrack')
    artists = models.ManyToManyField(Artist, blank=True, related_name='tracks')
    genres = models.ManyToManyField(Genre, blank=True, related_name='tracks')

    @property
    def get_cover_url(self):
        if self.albums.exists():
            main_album = self.albums.first()
            if main_album.cover_file:
                return main_album.cover_file.url

        if self.single_cover:
            return self.single_cover.url
        return None


class Album(models.Model):
    title = models.CharField(max_length=100)
    cover_file = models.ImageField(upload_to=album_cover_upload_path, blank=True, null=True)
    release_date = models.DateField()
    genres = models.ManyToManyField(Genre, blank=True, related_name='albums')
    artists = models.ManyToManyField(Artist, blank=True, related_name='albums')


class AlbumTrack(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    track_number = models.IntegerField()

    class Meta:
        unique_together = ('album', 'track_number')
        ordering = ['track_number']