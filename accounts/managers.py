from django.contrib.auth.models import UserManager, Group


class CustomUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        user = super().create_user(username, email, password, **extra_fields)
        listener_group, _ = Group.objects.get_or_create(name='Listeners')
        user.groups.add(listener_group)
        return user

    def create_curator(self, username, email=None, password=None, **extra_fields):
        user = super().create_user(username, email, password, **extra_fields)
        curators_group, _ = Group.objects.get_or_create(name='Curators')
        user.groups.add(curators_group)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return super().create_superuser(username, email, password, **extra_fields)