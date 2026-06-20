from multiprocessing import context

from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views import View, generic
from django.shortcuts import redirect

from listeners.models import Playlist


# Create your views here.
def get_suggestions(request):
    return render(request, 'suggestions.html')

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

        if playlist_id:
            playlist = Playlist.objects.get(id=playlist_id)
            if 'title' in request.POST:
                playlist.is_public = request.POST.get('is_public') == 'on'
                playlist.title = request.POST.get('title')

                playlist.save()
            else:
                Playlist.objects.filter(id=playlist_id).delete()

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
