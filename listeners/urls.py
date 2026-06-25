from django.urls import path, include

from listeners.views import get_suggestions, PlaylistView, CreatePlaylistView, PlaylistSongsView, add_song_to_playlist, remove_track_from_playlist, SavePlaylistView

urlpatterns = [
    path('suggestions/', get_suggestions, name="suggestions"),
    path('playlists/', PlaylistView.as_view(), name='user_playlists'),
    path('playlists/create', CreatePlaylistView.as_view(), name='create_playlist'),
    path('playlists/<int:playlist_id>/', PlaylistSongsView.as_view(), name='playlist_detail'),
    path('playlists/add_track/', add_song_to_playlist, name='add_song'),
    path('playlists/<int:playlist_id>/remove_track/<int:track_id>/', remove_track_from_playlist, name='remove_track_from_playlist'),
    path('playlist/save/', SavePlaylistView.as_view(), name='save_playlist'),

]