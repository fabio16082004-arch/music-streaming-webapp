from django.urls import path, include

from listeners.views import get_suggestions, PlaylistView, CreatePlaylistView

urlpatterns = [
    path('suggestions/', get_suggestions, name="suggestions"),
    path('playlists/', PlaylistView.as_view(), name='user_playlists'),
    path('playlists/create', CreatePlaylistView.as_view(), name='create_playlist'),
]