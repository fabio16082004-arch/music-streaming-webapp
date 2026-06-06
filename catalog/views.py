from django.shortcuts import render
from .models import Track, Album, Artist
from listeners.models import Playlist
from .filters import TrackFilter, AlbumFilter, ArtistFilter, PlaylistFilter
from django.db.models import Q


def global_search_view(request):
    query = request.GET.get('q', '')

    if not query:
        return render(request, 'catalog/global_search.html', {})

    track_filter = TrackFilter(request.GET, queryset=Track.objects.all())
    album_filter = AlbumFilter(request.GET, queryset=Album.objects.all())
    artist_filter = ArtistFilter(request.GET, queryset=Artist.objects.all())

    allowed_playlists = Playlist.objects.filter(Q(user=request.user) | Q(is_public=True))
    playlist_filter = PlaylistFilter(request.GET, queryset=allowed_playlists)

    context = {
        'query': query,
        'tracks': track_filter.qs,
        'albums': album_filter.qs,
        'artists': artist_filter.qs,
        'playlists': playlist_filter.qs,
    }

    return render(request, 'catalog/global_search.html', context)