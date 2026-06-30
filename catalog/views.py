import os
from multiprocessing import context

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404
from django.views import View

from .models import Track, Album, Artist, Genre, AlbumTrack
from listeners.models import Playlist
from .filters import TrackFilter, AlbumFilter, ArtistFilter, PlaylistFilter
from django.db.models import Q
import json

class SearchView(View):
    def get(self, request):

        genre_list = list(Genre.objects.values_list('name', flat=True))
        return render(request, 'search.html', {
            "db_genres_json": json.dumps(genre_list),
        })


class SearchResultsView(View):
    def get(self, request):
        print(request.GET)
        query = request.GET.get('q', '').strip()

        allowed_playlists = Playlist.objects.filter(
            Q(listener=request.user) | Q(is_public=True)
        )

        listener_playlists = Playlist.objects.filter(listener=request.user)

        context = dict()
        if request.GET.get('category') == 'all':
            context = {
                'query': query,
                'tracks': TrackFilter(request.GET, queryset=Track.objects.all()).qs,
                'albums': AlbumFilter(request.GET, queryset=Album.objects.all()).qs,
                'artists': ArtistFilter(request.GET, queryset=Artist.objects.all()).qs,
                'playlists': PlaylistFilter(request.GET, queryset=allowed_playlists).qs,
                'listener_playlists': listener_playlists,
                'MEDIA_URL': settings.MEDIA_URL
            }
            return render(request, 'search_results.html', context)
        else:
            context['query'] = query
            if request.GET.get('category') == 'track':
                context['tracks'] = TrackFilter(request.GET, queryset=Track.objects.all()).qs
            if request.GET.get('category') == 'album':
                context['albums'] = AlbumFilter(request.GET, queryset=Album.objects.all()).qs
            if request.GET.get('category') == 'artist':
                context['artists'] = ArtistFilter(request.GET, queryset=Artist.objects.all()).qs
            if request.GET.get('category') == 'playlist':
                context['playlists'] = PlaylistFilter(request.GET, queryset=allowed_playlists).qs
            context['listener_playlists'] = listener_playlists
            context['MEDIA_URL'] = settings.MEDIA_URL
            return render(request, 'search_results.html', context)

class AlbumView(LoginRequiredMixin, View):
    template_name = 'album_detail.html'

    def get(self, request, album_id):
        album = get_object_or_404(Album, id=album_id)

        tracks = (
            Track.objects
            .filter(albums=album)
            .order_by('albumtrack__track_number')
        )

        listener_playlists = Playlist.objects.filter(listener=request.user)

        context = {
            'album': album,
            'tracks': tracks,
            'listener_playlists': listener_playlists,
            'MEDIA_URL': settings.MEDIA_URL,
        }
        return render(request, self.template_name, context)


class ArtistView(LoginRequiredMixin, View):
    template_name = 'artist_detail.html'

    def get(self, request, artist_id):
        artist = get_object_or_404(Artist, id=artist_id)

        tracks = Track.objects.filter(artists=artist).order_by('-release_date')[:5]

        albums = Album.objects.filter(artists=artist).order_by('-release_date')

        listener_playlists = Playlist.objects.filter(listener=request.user)

        context = {
            'artist': artist,
            'tracks': tracks,
            'albums': albums,
            'listener_playlists': listener_playlists,
            'MEDIA_URL': settings.MEDIA_URL,
        }
        return render(request, self.template_name, context)