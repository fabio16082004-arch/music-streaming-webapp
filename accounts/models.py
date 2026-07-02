from django.contrib.auth.models import AbstractUser
from django.db import models

from accounts.managers import CustomUserManager


class User(AbstractUser):
    objects = CustomUserManager()

    @property
    def is_curator(self):
        return self.groups.filter(name='Curators').exists()

    @property
    def is_listener(self):
        return self.groups.filter(name='Listeners').exists()

    @property
    def is_admin(self):
        return self.is_superuser

    def __str__(self):
        role = 'Admin' if self.is_admin else ('Curator' if self.is_curator else 'Listener')
        return f"{self.username} ({role})"