from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Track, Album, Artist, Genre
from listeners.models import Playlist
from .filters import TrackFilter, AlbumFilter, ArtistFilter, PlaylistFilter
from django.db.models import Q
import json



@login_required
def global_search_view(request):
    query = request.GET.get('q', '')
    genre_list = list(Genre.objects.values_list('name', flat=True))

    if not query:
        return render(request, 'search.html', {"db_genres_json": json.dumps(genre_list)})

    track_filter = TrackFilter(request.GET, queryset=Track.objects.all())
    album_filter = AlbumFilter(request.GET, queryset=Album.objects.all())
    artist_filter = ArtistFilter(request.GET, queryset=Artist.objects.all())

    allowed_playlists = Playlist.objects.filter(Q(listener=request.user) | Q(is_public=True))
    playlist_filter = PlaylistFilter(request.GET, queryset=allowed_playlists)

    context = {
        'query': query,
        'tracks': track_filter.qs,
        'albums': album_filter.qs,
        'artists': artist_filter.qs,
        'playlists': playlist_filter.qs,
        "db_genres_json": genre_list
    }

    return render(request, 'search.html', context)