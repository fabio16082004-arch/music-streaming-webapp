from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.views.generic import CreateView

from accounts.forms import ListenerSignupForm


# Create your views here.
class ListenerLoginView(LoginView):
    template_name = "registration/login.html"

class ListenerSignupView(CreateView):
    form_class = ListenerSignupForm
    success_url = reverse_lazy('login')
    template_name = "registration/signup.html"
