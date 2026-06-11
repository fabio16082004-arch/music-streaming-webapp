import django_filters

from listeners.models import Playlist
from .models import Track, Album, Artist


class TrackFilter(django_filters.FilterSet):
    class Meta:
        model = Track
        fields = ["genre", "duration", "explicit", "year"]

    q = django_filters.CharFilter(field_name='title', lookup_expr='istartswith')
    year = django_filters.NumberFilter(field_name='release_date', lookup_expr='year')
    genre = django_filters.CharFilter(field_name='genres__name', lookup_expr='icontains')
    max_duration = django_filters.NumberFilter(field_name='duration', lookup_expr='lte')
    explicit = django_filters.BooleanFilter(field_name='explicit')

class AlbumFilter(django_filters.FilterSet):
    class Meta:
        model = Album
        fields = ["genre", "year"]

    q = django_filters.CharFilter(field_name='title', lookup_expr='istartswith')
    genre = django_filters.CharFilter(field_name='genres__name', lookup_expr='icontains')
    year = django_filters.NumberFilter(field_name='release_date', lookup_expr='year')

class ArtistFilter(django_filters.FilterSet):
    class Meta:
        model = Artist
        fields = ["country", "initial"]

    q = django_filters.CharFilter(field_name='stage_name', lookup_expr='istartswith')
    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')
    initial = django_filters.CharFilter(field_name='stage_name', lookup_expr='istartswith')

class PlaylistFilter(django_filters.FilterSet):
    class Meta:
        model = Playlist
        fields = []
    q = django_filters.CharFilter(field_name='title', lookup_expr='istartswith')
