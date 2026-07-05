from django.urls import path, include
from django.views import View

from catalog.views import SearchView, SearchResultsView, AlbumView, ArtistView, TrackCreateView, AlbumCreateView, \
    ArtistCreateView, GenreCreateView, TrackUpdateView, AlbumUpdateView, ArtistUpdateView, \
    TrackDeleteView, AlbumDeleteView, ArtistDeleteView, GenreDeleteView, TracksOfAlbumView, GenreDeleteSelectView

urlpatterns = [
    #USERS' FUNCTIONS
    path('search/', SearchView.as_view(), name='search'),
    path('search/results/', SearchResultsView.as_view(), name='search-results'),
    path('album/<int:album_id>/', AlbumView.as_view(), name='album_detail'),
    path('artist/<int:artist_id>/', ArtistView.as_view(), name='artist_detail'),

    #CURATORS' FUNCTIONS
    path('tracks/create/', TrackCreateView.as_view(), name='track_create'),
    path('albums/create/', AlbumCreateView.as_view(), name='album_create'),
    path('artists/create/', ArtistCreateView.as_view(), name='artist_create'),
    path('genres/create/', GenreCreateView.as_view(), name='genre_create'),

    path('tracks/<int:track_id>/edit/', TrackUpdateView.as_view(), name='track_edit'),
    path('albums/<int:album_id>/edit/', AlbumUpdateView.as_view(), name='album_edit'),
    path('artists/<int:artist_id>/edit/', ArtistUpdateView.as_view(), name='artist_edit'),

    path('tracks/<int:track_id>/delete/', TrackDeleteView.as_view(), name='track_delete'),
    path('albums/<int:album_id>/delete/', AlbumDeleteView.as_view(), name='album_delete'),
    path('artists/<int:artist_id>/delete/', ArtistDeleteView.as_view(), name='artist_delete'),
    path('genres/<int:genre_id>/delete/', GenreDeleteView.as_view(), name='genre_delete'),
    path('genres/delete/', GenreDeleteSelectView.as_view(), name='genre_delete_select'),
    path('tracks/album/<int:album_id>/', TracksOfAlbumView.as_view(), name='tracks_of_album'),
]