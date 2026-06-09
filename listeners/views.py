from django.shortcuts import render
from django.views import View


# Create your views here.
def get_suggestions(request):
    return render(request, 'suggestions.html')

class UserPlaylistsView(View):
    pass