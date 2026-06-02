from django.db import models

class Artist(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    stage_name = models.CharField(max_length=100)
    biography = models.TextField()
    country = models.CharField(max_length=100)

class Genre(models.Model):
    name = models.CharField(max_length=100)

class Track(models.Model):
    title = models.CharField(max_length=100)
    duration = models.IntegerField()
    track_number = models.IntegerField()
    explicit = models.BooleanField()
    audio_url = models.URLField()
    release_date = models.DateField()
    artists = models.ManyToManyField(Artist, blank=True, related_name='tracks')
    playlists = models.ManyToManyField('listeners.Playlist', blank=True, related_name='tracks')

class Album(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    cover_url = models.URLField()
    release_date = models.DateField() 
    genres = models.ManyToManyField(Genre, blank=True, related_name='albums')
    artists = models.ManyToManyField(Artist, blank=True, related_name='albums')