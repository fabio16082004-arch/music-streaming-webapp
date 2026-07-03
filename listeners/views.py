from multiprocessing import context

from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import HttpResponseForbidden, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils.dateparse import parse_datetime
from django.utils.decorators import method_decorator
from django.views import View, generic
from django.shortcuts import redirect
from django.views.decorators.cache import never_cache
from django.views.generic import ListView, TemplateView
import uuid
import json
from django.core.cache import cache

from catalog.models import Track, Artist
from listeners.models import Playlist, MonthlyListeningStatistic
from listeners.recommendations import get_recommendations

class PlaylistView(LoginRequiredMixin, generic.ListView):
    model = Playlist
    template_name = "user_playlists.html"
    context_object_name = 'playlists'

    def get_queryset(self):
        return Playlist.objects.filter(listener=self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        saved_playlists = Playlist.objects.filter(
            saved_by=self.request.user,
            is_public=True,
        ).exclude(
            listener=self.request.user)

        context['saved_playlists'] = saved_playlists
        return context

    def post(self, request, *args, **kwargs):
        playlist_id = request.POST.get('playlist_id')
        user_id = request.POST.get('user_id')

        if user_id:
            playlist = get_object_or_404(Playlist, pk=playlist_id, is_public=True)
            playlist.saved_by.remove(request.user)
        elif playlist_id:
            playlist = get_object_or_404(Playlist, id=playlist_id, listener=request.user)
            if 'title' in request.POST:
                playlist.is_public = request.POST.get('is_public') == 'on'
                playlist.title = request.POST.get('title')

                playlist.save()
            else:
                playlist.delete()

        return redirect("user_playlists")

class CreatePlaylistView(LoginRequiredMixin, generic.CreateView):
    model = Playlist
    fields = ['title', 'is_public']
    template_name = "user_playlists.html"

    def form_valid(self, form):
        form.instance.listener = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        from django.urls import reverse
        return reverse('user_playlists')

@method_decorator([login_required, never_cache], name='dispatch')
class PlaylistSongsView(LoginRequiredMixin, ListView):
    model = Track
    context_object_name = 'tracks'
    template_name = 'playlist_detail.html'

    def get(self, request, *args, **kwargs):
        self.playlist = get_object_or_404(Playlist, pk=kwargs['playlist_id'])

        is_owner = self.playlist.listener_id == request.user.id
        is_saved = self.playlist.saved_by.filter(pk=request.user.pk).exists()
        if not self.playlist.is_public and not is_owner and not is_saved:
            return HttpResponseForbidden("You don't have access to this playlist.")

        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return self.playlist.tracks.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        context['playlist'] = self.playlist
        context['user_playlists'] = Playlist.objects.filter(
            listener=self.request.user
        ).exclude(pk=self.playlist.pk)
        return context


def add_song_to_playlist(request):
    try:
        data = json.loads(request.body)
        playlist_id = data.get('playlist_id')
        song_id = data.get('song_id')

        playlist = get_object_or_404(Playlist, id=playlist_id, listener=request.user)

        if playlist.tracks.filter(id=song_id).exists():
            return JsonResponse({
                'success': False,
                'error': f'The song is already in {playlist.title}!'
            }, status=409)

        playlist.tracks.add(song_id)

        return JsonResponse({
            'success': True,
            'message': f'Song added successfully to {playlist.title}!'
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
def remove_track_from_playlist(request, playlist_id, track_id):
    playlist = Playlist.objects.get(id=playlist_id, listener=request.user)

    playlist.tracks.remove(track_id)
    return JsonResponse({'status': 'success'}, status=200)


class SavePlaylistView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            playlist_id = data.get('playlist_id')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid request.'}, status=400)

        if not playlist_id:
            return JsonResponse({'error': 'Missing playlist_id.'}, status=400)

        try:
            playlist = Playlist.objects.get(pk=playlist_id, is_public=True)
        except Playlist.DoesNotExist:
            return JsonResponse({'error': 'Playlist not found.'}, status=404)

        if playlist.saved_by.filter(pk=request.user.pk).exists():
            return JsonResponse({'error': 'You have already saved this playlist.'}, status=409)

        playlist.saved_by.add(request.user)
        return JsonResponse({'success': True, 'message': f'"{playlist.title}" saved to your library!'})


class StartPlaybackView(PermissionRequiredMixin, View):
    permission_required = 'listeners.log_playback'
    def post(self, request):
        try:
            data = json.loads(request.body)
            track_id = data.get('track_id')

            track = get_object_or_404(Track, id=track_id)

            session_token = str(uuid.uuid4())
            cache_key = f"playback:{session_token}"

            cache.set(
                cache_key,
                {
                    'user_id': request.user.id,
                    'track_id': track_id,
                    'started_at': timezone.now().isoformat()
                },
                timeout=track.duration + 60  #60 seconds of security margin before the timeout of the session
            )

            return JsonResponse({'status': 'success', 'session_token': session_token})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


class StopPlaybackView(LoginRequiredMixin, PermissionRequiredMixin, View):
    permission_required = 'listeners.log_playback'
    def post(self, request):
        try:
            data = json.loads(request.body)
            session_token = data.get('session_token')

            cache_key = f"playback:{session_token}"
            playback_data = cache.get(cache_key)

            if not playback_data:
                return JsonResponse({'status': 'error', 'message': 'session not found or expired'}, status=400)

            if playback_data['user_id'] != request.user.id:
                return JsonResponse({'status': 'error', 'message': 'forbidden'}, status=403)

            started_at = parse_datetime(playback_data['started_at'])
            seconds = (timezone.now() - started_at).total_seconds()

            track = get_object_or_404(Track, id=playback_data['track_id'])
            seconds = min(seconds, track.duration)

            now = timezone.now()

            obj, created = MonthlyListeningStatistic.objects.get_or_create(
                listener=request.user,
                track_id=playback_data['track_id'],
                month=now.month,
                year=now.year
            )

            obj.seconds_listened += seconds
            obj.save()

            cache.delete(cache_key)

            return JsonResponse({'status': 'success', 'total': obj.seconds_listened})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

class RecommendationsView(LoginRequiredMixin, TemplateView):
    template_name = "suggestions.html"
    def get_context_data(self, **kwargs):
        context = super().get_context_data()
        context['tracks'] = get_recommendations(self.request.user)

        listener_playlists = Playlist.objects.filter(listener=self.request.user)
        context['listener_playlists'] = listener_playlists
        return context


