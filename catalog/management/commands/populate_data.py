from django.core.management.base import BaseCommand
from catalog.models import Artist, Genre, Album, Track, AlbumTrack
from datetime import date


class Command(BaseCommand):
    help = 'Popola il database con i movimenti e i dati di esempio di Mach-Hommy'

    def handle(self, *args, **options):
        mach_hommy, created = Artist.objects.get_or_create(
            id=1,
            defaults={
                'first_name': 'Mach',
                'last_name': 'Hommy',
                'stage_name': 'Mach-Hommy',
                'email': 'mach@hommy.com',
                'biography': 'Haitian-American rapper based in Newark, New Jersey.',
                'country': 'US'
            }
        )

        hip_hop, _ = Genre.objects.get_or_create(name='Hip Hop')

        album, created = Album.objects.get_or_create(
            id=1,
            defaults={
                'name': 'Mach-Hommy Records',
                'title': 'The G.A.T.',
                'release_date': date(2021, 5, 21),
                'cover_file': 'catalog/covers/1/1/NTQtNDg1My5qcGVn.png'
            }
        )

        if created:
            album.genres.add(hip_hop)
            album.artists.add(mach_hommy)

        track_files = [
            'I.mp3', 'II.mp3', 'III.mp3', 'IV.mp3', 'V.mp3',
            'VI.mp3', 'VII.mp3', 'VIII.mp3', 'X - IX.mp3'
        ]

        for index, filename in enumerate(track_files, start=1):
            titolo_traccia = filename.replace('.mp3', '')

            track, track_created = Track.objects.get_or_create(
                title=titolo_traccia,
                defaults={
                    'duration': 180,
                    'explicit': True,
                    'release_date': date(2021, 5, 21),
                    'audio_file': f'catalog/tracks/1/1/{filename}'
                }
            )

            if track_created:
                track.artists.add(mach_hommy)

                AlbumTrack.objects.create(
                    album=album,
                    track=track,
                    track_number=index
                )