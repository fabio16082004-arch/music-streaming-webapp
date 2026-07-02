from django import forms
from django.core.files.uploadedfile import UploadedFile
from django.core.validators import FileExtensionValidator
from mutagen import File as MutagenFile

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

    class Meta:
        model = Track
        fields = [
            'title', 'explicit', 'audio_file',
            'single_cover', 'release_date', 'artists', 'genres',
        ]

    def clean_audio_file(self):
        audio_file = self.cleaned_data.get('audio_file')

        if audio_file and isinstance(audio_file, UploadedFile):
            audio_file.seek(0)
            audio = MutagenFile(audio_file)
            audio_file.seek(0)

            if audio is None or audio.info is None or not getattr(audio.info, 'length', None):
                raise forms.ValidationError(
                    "Impossible to determine the file's duration. "
                    "Make sure if the file is a valid .mp4 or .mp3"
                )

            self._computed_duration = round(audio.info.length)

        return audio_file

    def save(self, commit=True):
        instance = super().save(commit=False)
        if hasattr(self, '_computed_duration'):
            instance.duration = self._computed_duration
        if commit:
            instance.save()
            self.save_m2m()
        return instance

    def clean(self):
        cleaned_data = super().clean()
        album = cleaned_data.get('album')
        track_number = cleaned_data.get('track_number')

        if album and not track_number:
            self.add_error('track_number', "Track number is required when an album is selected.")

        if album and track_number:
            conflict_qs = AlbumTrack.objects.filter(album=album, track_number=track_number)
            if self.instance.pk:
                conflict_qs = conflict_qs.exclude(track_id=self.instance.pk)
            if conflict_qs.exists():
                self.add_error(
                    'track_number',
                    f"Track number {track_number} is already used in this album."
                )

        return cleaned_data


class AlbumForm(forms.ModelForm):
    class Meta:
        model = Album
        fields = ['title', 'cover_file', 'release_date', 'artists', 'genres']


class ArtistForm(forms.ModelForm):
    class Meta:
        model = Artist
        fields = ['stage_name', 'first_name', 'last_name', 'biography', 'country']


class GenreForm(forms.ModelForm):
    class Meta:
        model = Genre
        fields = ['name']