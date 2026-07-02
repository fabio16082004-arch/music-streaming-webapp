from django.contrib.auth.models import Group, Permission


def setup_roles(sender, **kwargs):
    listeners_group, _ = Group.objects.get_or_create(name='Listeners')
    curators_group, _ = Group.objects.get_or_create(name='Curators')

    listeners_group.permissions.set(
        Permission.objects.filter(
            content_type__app_label='catalog',
            codename__startswith='view_'
        )
    )

    curators_group.permissions.set(
        Permission.objects.filter(
            content_type__app_label='catalog',
            codename__in=[
                'view_artist', 'add_artist', 'change_artist', 'delete_artist',
                'view_album', 'add_album', 'change_album', 'delete_album',
                'view_track', 'add_track', 'change_track', 'delete_track',
                'view_genre', 'add_genre', 'change_genre', 'delete_genre',
            ]
        )
    )