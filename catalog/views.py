import os
from multiprocessing import context

from django.conf import settings
from django.shortcuts import render
from django.views import View

from .models import Track, Album, Artist, Genre
from listeners.models import Playlist
from .filters import TrackFilter, AlbumFilter, ArtistFilter, PlaylistFilter
from django.db.models import Q
import json

class SearchView(View):
    def get(self, request):
        genre_list = list(Genre.objects.values_list('name', flat=True))
        return render(request, 'search.html', {
            "db_genres_json": json.dumps(genre_list)
        })


class SearchResultsView(View):
    def get(self, request):
        print(request.GET)
        query = request.GET.get('q', '').strip()

        allowed_playlists = Playlist.objects.filter(
            Q(listener=request.user) | Q(is_public=True)
        )

        context = dict()
        if request.GET.get('category') == 'all':
            context = {
                'query': query,
                'tracks': TrackFilter(request.GET, queryset=Track.objects.all()).qs,
                'albums': AlbumFilter(request.GET, queryset=Album.objects.all()).qs,
                'artists': ArtistFilter(request.GET, queryset=Artist.objects.all()).qs,
                'playlists': PlaylistFilter(request.GET, queryset=allowed_playlists).qs,
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
                context['playlists'] = PlaylistFilter(request.GET, queryset=Playlist.objects.all()).qs
            context['MEDIA_URL'] = settings.MEDIA_URL
            return render(request, 'search_results.html', context)


