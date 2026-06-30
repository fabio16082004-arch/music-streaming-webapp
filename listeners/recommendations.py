# recommendations.py

from collections import defaultdict
from datetime import date
from django.db.models import Q

from catalog.models import Track
from .models import MonthlyListeningStatistic, Playlist


MAX_TRACKS_PER_ARTIST = 2
CANDIDATE_POOL_SIZE = 300
TOP_GENRES_COUNT = 5
MONTHS_WINDOW = 5
PLAYLIST_WEIGHT = 10


def get_recent_months():
    today = date.today()
    months = []
    y, m = today.year, today.month
    for _ in range(MONTHS_WINDOW):
        months.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    return months


def build_user_genre_profile(user):
    recent_months = get_recent_months()
    genre_scores = defaultdict(float)

    stats = (
        MonthlyListeningStatistic.objects
        .filter(listener=user)
        .prefetch_related('track__genres')
    )
    for stat in stats:
        if (stat.year, stat.month) in recent_months:
            for genre in stat.track.genres.all():
                genre_scores[genre.id] += stat.seconds_listened

    # playlist
    playlists = Playlist.objects.filter(listener=user).prefetch_related('tracks__genres')
    for playlist in playlists:
        for track in playlist.tracks.all():
            for genre in track.genres.all():
                    genre_scores[genre.id] += PLAYLIST_WEIGHT

    return genre_scores


def user_has_recent_history(user):
    recent_months = get_recent_months()

    q = Q()
    for y, m in recent_months:
        q |= Q(year=y, month=m)

    has_recent_listening = MonthlyListeningStatistic.objects.filter(listener=user).filter(q).exists()
    has_playlist_tracks = Playlist.objects.filter(listener=user, tracks__isnull=False).exists()

    return has_recent_listening or has_playlist_tracks


def get_candidate_tracks(user, profile):
    if not profile:
        return []

    already_listened_ids = set(
        stat.track_id for stat in MonthlyListeningStatistic.objects.filter(listener=user)
    )

    top_genre_ids = sorted(profile, key=profile.get, reverse=True)[:TOP_GENRES_COUNT]

    candidates = (
        Track.objects
        .filter(genres__id__in=top_genre_ids)
        .exclude(id__in=already_listened_ids)
        .prefetch_related('genres', 'artists')[:CANDIDATE_POOL_SIZE]
    )

    return list(candidates)


def apply_diversity_filter(scored_tracks, n=10, max_per_artist=MAX_TRACKS_PER_ARTIST):
    final = []
    artist_count = defaultdict(int)

    for track, score in scored_tracks:
        artist_ids = [a.id for a in track.artists.all()]

        if any(artist_count[aid] >= max_per_artist for aid in artist_ids):
            continue
        final.append(track)

        for artist_id in artist_ids:
            artist_count[artist_id] += 1

        if len(final) == n:
            break

    return final


def get_random_recommendations(n=10):
    return list(Track.objects.order_by('?')[:n])

def score_track(track, profile):
    genres = track.genres.all()
    if not genres:
        return 0
    return sum(profile.get(genre.id, 0) for genre in genres) / len(genres)


def get_recommendations(user, n=10):
    if not user_has_recent_history(user):
        return get_random_recommendations(n=n)

    profile = build_user_genre_profile(user)
    candidates = get_candidate_tracks(user, profile)

    if not candidates:
        return get_random_recommendations(n=n)

    scored = [(track, score_track(track, profile)) for track in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)

    return apply_diversity_filter(scored, n=n)