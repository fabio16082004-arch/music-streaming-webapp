from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        LISTENER = 'listener', 'Listener'
        CURATOR = 'curator', 'Curator'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.LISTENER
    )

    @property
    def is_curator(self):
        return self.role == self.Role.CURATOR

    @property
    def is_listener(self):
        return self.role == self.Role.LISTENER

    def __str__(self):
        return f"{self.username} ({self.role})"