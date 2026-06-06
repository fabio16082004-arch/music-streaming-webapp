import django_filters

from listeners.models import Playlist
from .models import Track, Album, Artist


class TrackFilter(django_filters.FilterSet):
    class Meta:
        model = Track

    q = django_filters.CharFilter(field_name='title', lookup_expr='istartswith')
    genre = django_filters.CharFilter(field_name='genre', lookup_expr='icontains')
    max_duration = django_filters.NumberFilter(field_name='duration', lookup_expr='lte')
    explicit = django_filters.BooleanFilter(field_name='explicit')

class AlbumFilter(django_filters.FilterSet):
    class Meta:
        model = Album

    q = django_filters.CharFilter(field_name='title', lookup_expr='istartswith')
    genre = django_filters.CharFilter(field_name='genre', lookup_expr='icontains')
    duration = django_filters.NumberFilter(field_name='duration', lookup_expr='lte')

class ArtistFilter(django_filters.FilterSet):
    class Meta:
        model = Artist

    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')
    stage_name_initial = django_filters.CharFilter(field_name='stage_name_initial', lookup_expr='istartswith')

class PlaylistFilter(django_filters.FilterSet):
    class Meta:
        model = Playlist

    q = django_filters.CharFilter(field_name='title', lookup_expr='istartswith')
