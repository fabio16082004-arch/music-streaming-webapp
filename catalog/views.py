import os
from datetime import date
from multiprocessing import context

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import CreateView, UpdateView, DeleteView, ListView, TemplateView

from .forms import ArtistForm, GenreForm, TrackForm, AlbumForm
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


class ResourceFormContextMixin:
    resource_type = None
    template_name = 'manage_resources.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['mode'] = 'edit' if self.object and self.object.pk else 'create'
        context['resource_type'] = self.resource_type
        context['all_artists'] = Artist.objects.all().order_by('stage_name')
        context['all_genres'] = Genre.objects.all().order_by('name')
        context['all_albums'] = Album.objects.all().order_by('title')
        context['today_date'] = date.today().strftime('%Y-%m-%d')
        return context
# ===========================
# TRACK
# ===========================

class TrackCreateView(PermissionRequiredMixin, ResourceFormContextMixin, CreateView):
    model = Track
    form_class = TrackForm
    permission_required = 'catalog.add_track'
    resource_type = 'track'
    success_url = reverse_lazy('search')
    # form_valid di default: TrackForm.save() gestisce già M2M, AlbumTrack
    # (con shift automatico delle posizioni) e la scrittura dei file.


class TrackUpdateView(PermissionRequiredMixin, ResourceFormContextMixin, UpdateView):
    model = Track
    form_class = TrackForm
    permission_required = 'catalog.change_track'
    resource_type = 'track'
    pk_url_kwarg = 'track_id'
    success_url = reverse_lazy('search')

    def get_initial(self):
        initial = super().get_initial()
        album_track = AlbumTrack.objects.filter(track=self.object).first()
        if album_track:
            initial['album'] = album_track.album_id
            initial['track_number'] = album_track.track_number
        return initial

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        album_track = AlbumTrack.objects.filter(track=self.object).first()
        context['track_number'] = album_track.track_number if album_track else None
        return context

class TrackDeleteView(PermissionRequiredMixin, DeleteView):
    model = Track
    permission_required = 'catalog.delete_track'
    pk_url_kwarg = 'track_id'
    success_url = reverse_lazy('search')
    http_method_names = ['post']


# ===========================
# ALBUM
# ===========================

class AlbumCreateView(PermissionRequiredMixin, ResourceFormContextMixin, CreateView):
    model = Album
    form_class = AlbumForm
    permission_required = 'catalog.add_album'
    resource_type = 'album'
    success_url = reverse_lazy('search')


class AlbumUpdateView(PermissionRequiredMixin, ResourceFormContextMixin, UpdateView):
    model = Album
    form_class = AlbumForm
    permission_required = 'catalog.change_album'
    resource_type = 'album'
    pk_url_kwarg = 'album_id'
    success_url = reverse_lazy('search')


class AlbumDeleteView(PermissionRequiredMixin, DeleteView):
    model = Album
    permission_required = 'catalog.delete_album'
    pk_url_kwarg = 'album_id'
    success_url = reverse_lazy('search')
    http_method_names = ['post']

# ===========================
# ARTIST
# ===========================
class ArtistCreateView(PermissionRequiredMixin, ResourceFormContextMixin, CreateView):
    model = Artist
    form_class = ArtistForm
    permission_required = 'catalog.add_artist'
    resource_type = 'artist'
    success_url = reverse_lazy('search')



class ArtistUpdateView(PermissionRequiredMixin, ResourceFormContextMixin, UpdateView):
    model = Artist
    form_class = ArtistForm
    permission_required = 'catalog.change_artist'
    resource_type = 'artist'
    pk_url_kwarg = 'artist_id'
    success_url = reverse_lazy('search')


class ArtistDeleteView(PermissionRequiredMixin, DeleteView):
    model = Artist
    permission_required = 'catalog.delete_artist'
    pk_url_kwarg = 'artist_id'
    success_url = reverse_lazy('search')
    http_method_names = ['post']


# ===========================
# GENRE
# ===========================

class GenreCreateView(PermissionRequiredMixin, ResourceFormContextMixin, CreateView):
    model = Genre
    form_class = GenreForm
    permission_required = 'catalog.add_genre'
    resource_type = 'genre'
    success_url = reverse_lazy('search')


class GenreUpdateView(PermissionRequiredMixin, ResourceFormContextMixin, UpdateView):
    model = Genre
    form_class = GenreForm
    permission_required = 'catalog.change_genre'
    resource_type = 'genre'
    pk_url_kwarg = 'genre_id'
    success_url = reverse_lazy('search')


class GenreDeleteView(PermissionRequiredMixin, DeleteView):
    model = Genre
    permission_required = 'catalog.delete_genre'
    pk_url_kwarg = 'genre_id'
    success_url = reverse_lazy('search')
    http_method_names = ['post']


class GenreDeleteSelectView(PermissionRequiredMixin, TemplateView):
    template_name = 'delete_genres.html'
    permission_required = 'catalog.delete_genre'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['all_genres'] = Genre.objects.all().order_by('name')
        return context


class TracksOfAlbumView(LoginRequiredMixin, ListView):
    model = AlbumTrack
    pk_url_kwarg = 'album_id'

    def get_queryset(self):
        album_id = self.kwargs.get(self.pk_url_kwarg)

        return AlbumTrack.objects.filter(album_id=album_id).order_by('track_number')

    def render_to_response(self, context, **response_kwargs):
        album_id = self.kwargs.get(self.pk_url_kwarg)
        album = get_object_or_404(Album, id=album_id)
        queryset = self.get_queryset()

        data = [
            {
                'track_id': at.track.id,
                'title': at.track.title,
                'track_number': at.track_number
            }
            for at in queryset
        ]

        return JsonResponse({
            'tracks': data,
            'artists': list(album.artists.values_list('id', flat=True)),
        }, safe=False)