from django.contrib.auth.views import LogoutView
from django.urls import path
from accounts.views import ListenerLoginView, ListenerSignupView

urlpatterns = [
    path("login/", ListenerLoginView.as_view(), name="login"),
    path("signup/", ListenerSignupView.as_view(), name="signup"),
    path("logout/", LogoutView.as_view(), name="logout"),
]