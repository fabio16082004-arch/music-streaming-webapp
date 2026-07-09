from datetime import date

from django import forms
from django.core.files.uploadedfile import UploadedFile
from django.core.validators import FileExtensionValidator
from django.db import transaction

from .models import Track, Album, Artist, Genre, AlbumTrack


class TrackForm(forms.ModelForm):
    album = forms.ModelChoiceField(
        queryset=Album.objects.all(),
        required=False,
        empty_label="— Single (no album) —",
    )
    track_number = forms.IntegerField(required=False, min_value=1)

    audio_file = forms.FileField(
        validators=[FileExtensionValidator(allowed_extensions=['mp3', 'mp4'])],
    )
    single_cover = forms.ImageField(
        required=False,
        validators=[FileExtensionValidator(allowed_extensions=['png', 'jpg', 'jpeg'])],
    )

    client_duration = forms.IntegerField(
        required=False,
        min_value=1,
        widget=forms.HiddenInput(),
    )

    class Meta:
        model = Track
        fields = [
            'title', 'explicit', 'audio_file',
            'single_cover', 'release_date', 'artists', 'genres',
        ]

    def clean_release_date(self):
        release_date = self.cleaned_data.get('release_date')
        if release_date and release_date > date.today():
            raise forms.ValidationError("Release date cannot be in the future.")
        return release_date

    def clean(self):
        cleaned_data = super().clean()

        audio_file = cleaned_data.get('audio_file')
        client_duration = cleaned_data.get('client_duration')

        if audio_file and isinstance(audio_file, UploadedFile) and not client_duration:
            self.add_error(
                'audio_file',
                "Impossible to get the duration in the browser "
            )

        album = cleaned_data.get('album')
        track_number = cleaned_data.get('track_number')

        if album and not track_number:
            self.add_error('track_number', "Track number is required when an album is selected.")

        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)

        client_duration = self.cleaned_data.get('client_duration')
        if client_duration:
            instance.duration = client_duration

        if commit:
            with transaction.atomic():
                instance.save()
                self.save_m2m()

                album = self.cleaned_data.get('album')
                track_number = self.cleaned_data.get('track_number')

                AlbumTrack.objects.filter(track=instance).delete()

                if album and track_number:
                    max_valid_position = AlbumTrack.objects.filter(album=album).count() + 1
                    if track_number > max_valid_position:
                        track_number = max_valid_position

                    slot_occupied = AlbumTrack.objects.filter(
                        album=album, track_number=track_number
                    ).exists()

                    if slot_occupied:
                        existing = AlbumTrack.objects.filter(
                            album=album, track_number__gte=track_number
                        ).order_by('-track_number')

                        for album_track in existing:
                            album_track.track_number += 1
                            album_track.save(update_fields=['track_number'])

                    AlbumTrack.objects.create(album=album, track=instance, track_number=track_number)

        return instance


class AlbumForm(forms.ModelForm):
    class Meta:
        model = Album
        fields = ['title', 'cover_file', 'release_date', 'artists', 'genres']

    def clean_release_date(self):
        release_date = self.cleaned_data.get('release_date')
        if release_date and release_date > date.today():
            raise forms.ValidationError("Release date cannot be in the future.")
        return release_date


class ArtistForm(forms.ModelForm):
    class Meta:
        model = Artist
        fields = ['stage_name', 'first_name', 'last_name', 'biography', 'country']


class GenreForm(forms.ModelForm):
    class Meta:
        model = Genre
        fields = ['name']