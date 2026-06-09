from django.contrib.auth.forms import UserCreationForm

from accounts.models import User


class ListenerSignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "username", "email")