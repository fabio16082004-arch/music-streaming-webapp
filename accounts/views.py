from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.views.generic import CreateView

from accounts.forms import ListenerSignupForm

# Create your views here.
class ListenerLoginView(LoginView):
    template_name = "registration/login.html"
    def get_success_url(self):
        user = self.request.user
        if user.is_listener:
            return reverse_lazy('suggestions')
        return reverse_lazy('search')

class SignupView(CreateView):
    form_class = ListenerSignupForm
    success_url = reverse_lazy('login')
    template_name = "registration/signup.html"