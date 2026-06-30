from django.urls import path, include
from django.views import View

from catalog.views import SearchView, SearchResultsView, AlbumView, ArtistView

urlpatterns = [
    path('search/', SearchView.as_view(), name='search'),
    path('search/results/', SearchResultsView.as_view(), name='search-results'),
    path('album/<int:album_id>/', AlbumView.as_view(), name='album_detail'),
    path('artist/<int:artist_id>/', ArtistView.as_view(), name='artist_detail'),
]