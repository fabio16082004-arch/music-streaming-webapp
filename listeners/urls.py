from django.urls import path, include

from listeners.views import get_suggestions, UserPlaylistsView

urlpatterns = [
    path('suggestions/', get_suggestions, name="suggestions"),
    path('playlists/', UserPlaylistsView.as_view(), name='user_playlists'),
]