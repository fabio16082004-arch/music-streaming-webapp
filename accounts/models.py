from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

from accounts.managers import CustomUserManager
from catalog.models import Genre


class User(AbstractUser):
    class Role(models.TextChoices):
        LISTENER = 'listener', 'Listener'
        CURATOR = 'curator', 'Curator'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.LISTENER,
        null=True,
        blank=True
    )
    objects = CustomUserManager()

    @property
    def is_curator(self):
        return self.role == self.Role.CURATOR

    @property
    def is_listener(self):
        return self.role == self.Role.LISTENER

    def __str__(self):
        return f"{self.username} ({self.role})"


class ListenerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='listener_profile'
    )
    favorite_genres = models.ManyToManyField(Genre, blank=True)

    def __str__(self):
        return f"Profilo Ascoltatore di {self.user.username}"


class CuratorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='curator_profile'
    )

    def __str__(self):
        return f"Profilo Curatore di {self.user.username}"