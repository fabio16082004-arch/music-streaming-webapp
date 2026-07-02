document.addEventListener('DOMContentLoaded', () => {

    /* ===========================
       ANTEPRIMA DURATA AUDIO (solo UX — il valore reale viene calcolato dal server)
       =========================== */
    const audioInput = document.getElementById('track-audio-file');
    const durationPreview = document.getElementById('track-duration-preview');

    if (audioInput && durationPreview) {
        audioInput.addEventListener('change', () => {
            const file = audioInput.files && audioInput.files[0];
            if (!file) {
                durationPreview.textContent = '';
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const probe = document.createElement('audio');
            probe.preload = 'metadata';

            probe.addEventListener('loadedmetadata', () => {
                const totalSeconds = Math.round(probe.duration);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = String(totalSeconds % 60).padStart(2, '0');
                durationPreview.textContent = `Duration: ${minutes}:${seconds}`;
                URL.revokeObjectURL(objectUrl);
            });

            probe.addEventListener('error', () => {
                durationPreview.textContent = 'Could not read duration from this file.';
                URL.revokeObjectURL(objectUrl);
            });

            probe.src = objectUrl;
        });
    }

    /* ===========================
       CUSTOM FILE INPUT — mostra il nome del file scelto
       =========================== */
    document.querySelectorAll('.custom-file-input').forEach(input => {
        const wrapper = input.closest('.file-input-wrapper');
        const nameSpan = wrapper ? wrapper.querySelector('.custom-file-name') : null;
        if (!nameSpan) return;

        input.addEventListener('change', () => {
            if (input.files && input.files.length > 0) {
                nameSpan.textContent = input.files[0].name;
            } else {
                nameSpan.textContent = nameSpan.dataset.default || 'No file selected';
            }
        });
    });

    /* ===========================
       MULTI-SELECT DROPDOWN (artisti / generi)
       Aggiorna l'etichetta del bottone in base a cosa è selezionato nel menu.
       =========================== */
    document.querySelectorAll('.multiselect-dropdown').forEach(wrapper => {
        const toggleLabel = wrapper.querySelector('.multiselect-toggle-label');
        const checkboxes = wrapper.querySelectorAll('.multiselect-checkbox');
        const placeholder = toggleLabel.dataset.placeholder;

        const updateLabel = () => {
            const checked = Array.from(checkboxes).filter(cb => cb.checked);

            if (checked.length === 0) {
                toggleLabel.textContent = placeholder;
            } else if (checked.length <= 2) {
                toggleLabel.textContent = checked
                    .map(cb => cb.closest('.multiselect-option').querySelector('span').textContent)
                    .join(', ');
            } else {
                toggleLabel.textContent = `${checked.length} selected`;
            }
        };

        checkboxes.forEach(cb => cb.addEventListener('change', updateLabel));
        updateLabel(); // stato iniziale, utile in modifica con valori già selezionati
    });

    /* ===========================
       CAMPO "TRACK NUMBER" VISIBILE SOLO SE È SELEZIONATO UN ALBUM
       =========================== */
    const albumSelect = document.getElementById('track-album');
    const trackNumberField = document.getElementById('track-number-field');

    const toggleTrackNumberField = () => {
        if (!albumSelect || !trackNumberField) return;
        trackNumberField.style.display = albumSelect.value ? 'flex' : 'none';
    };

    if (albumSelect) {
        toggleTrackNumberField();
        albumSelect.addEventListener('change', toggleTrackNumberField);
    }

});

 /* ===========================
       UPDATE THE CONTENT OF THE SINGLE DROPDOWN
 =========================== */
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.singleselect-dropdown').forEach(function (dropdown) {
        const label = dropdown.querySelector('.singleselect-toggle-label');
        const radios = dropdown.querySelectorAll('.singleselect-radio');
        const trackNumberContainer = document.getElementById('track-number-field');
        const singleCover = document.getElementById("track-single-cover");

        function syncTrackNumberVisibility(radio) {
            if (!trackNumberContainer) return;

            const isSingle = radio.value === '';
            trackNumberContainer.classList.toggle('d-none', isSingle);
            trackNumberContainer.classList.toggle('d-flex', !isSingle);
            singleCover.toggleAttribute('disabled', !isSingle);
        }

        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (!radio.checked) return;

                if (label) {
                    label.textContent = radio.closest('.singleselect-option').querySelector('span').textContent;
                }

                syncTrackNumberVisibility(radio);
            });

            if (radio.checked) {
                syncTrackNumberVisibility(radio);
            }
        });
    });
});