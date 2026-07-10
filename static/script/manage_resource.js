document.addEventListener('DOMContentLoaded', () => {

    const audioInput = document.getElementById('track-audio-file');
    const durationPreview = document.getElementById('track-duration-preview');
    const durationInput = document.getElementById('track-client-duration');

    if (audioInput && durationPreview) {
        audioInput.addEventListener('change', () => {
            const file = audioInput.files && audioInput.files[0];
            if (!file) {
                durationPreview.textContent = '';
                if (durationInput) durationInput.value = '';
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
                if (durationInput) durationInput.value = totalSeconds;
                URL.revokeObjectURL(objectUrl);
            });

            probe.addEventListener('error', () => {
                durationPreview.textContent = 'Could not read duration from this file.';
                if (durationInput) durationInput.value = '';
                URL.revokeObjectURL(objectUrl);
            });

            probe.src = objectUrl;
        });
    }

    /* ===========================
       CUSTOM FILE INPUT
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
       MULTI-SELECT DROPDOWN
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
        updateLabel();
    });

    /* ===========================
       FIELD "TRACK NUMBER" VISIBLE ONLY IF IS SELECTED IN AN ALBUM
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
      UPDATE THE CONTENT OF THE SINGLE DROPDOWN & TRACKLIST
=========================== */
document.addEventListener('DOMContentLoaded', function () {
    let uiTracks = []; // Array per mantenere lo stato dell'ordine in UI

    const titleInput = document.getElementById('track-title');

    function renderTracklist() {
        const ul = document.getElementById('album-tracklist');
        const hiddenTrackNumber = document.getElementById('track-number');

        if (!ul) return;
        ul.innerHTML = '';

        const currentTitle = titleInput && titleInput.value.trim() ? titleInput.value : 'NEW SONG';

        uiTracks.forEach((track, index) => {
            const pos = index + 1;
            const li = document.createElement('li');
            li.className = 'tracklist-item' + (track.isCurrent ? ' current-track' : '');

            const posSpan = document.createElement('span');
            posSpan.className = 'track-pos';
            posSpan.textContent = pos + '.';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'track-title';
            titleSpan.textContent = track.isCurrent ? currentTitle : track.title;

            li.appendChild(posSpan);
            li.appendChild(titleSpan);

            if (track.isCurrent) {
                const controls = document.createElement('div');
                controls.className = 'tracklist-controls';

                if (index > 0) {
                    const upBtn = document.createElement('button');
                    upBtn.type = 'button';
                    upBtn.className = 'tracklist-btn';
                    upBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
                    upBtn.onclick = (e) => {
                        e.preventDefault();
                        moveTrack(index, index - 1);
                    };
                    controls.appendChild(upBtn);
                }

                if (index < uiTracks.length - 1) {
                    const downBtn = document.createElement('button');
                    downBtn.type = 'button';
                    downBtn.className = 'tracklist-btn';
                    downBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
                    downBtn.onclick = (e) => {
                        e.preventDefault();
                        moveTrack(index, index + 1);
                    };
                    controls.appendChild(downBtn);
                }
                li.appendChild(controls);
            }
            ul.appendChild(li);
        });

        if (hiddenTrackNumber) {
            const newPos = uiTracks.findIndex(t => t.isCurrent) + 1;
            hiddenTrackNumber.value = newPos > 0 ? newPos : '';
        }
    }

    function moveTrack(fromIndex, toIndex) {
        const temp = uiTracks[fromIndex];
        uiTracks[fromIndex] = uiTracks[toIndex];
        uiTracks[toIndex] = temp;
        renderTracklist();
    }

    if (titleInput) {
        titleInput.addEventListener('input', renderTracklist);
    }

    document.querySelectorAll('.singleselect-dropdown').forEach(function (dropdown) {
        const label = dropdown.querySelector('.singleselect-toggle-label');
        const radios = dropdown.querySelectorAll('.singleselect-radio');
        const trackNumberContainer = document.getElementById('track-number-field');
        const hiddenTrackNumber = document.getElementById('track-number');
        const currentTrackId = document.getElementById('current-track-id')?.value;
        const singleCover = document.getElementById("track-single-cover");
        const artistsToggle = document.getElementById('track-artists-toggle');
        const artistCheckboxes = artistsToggle
            ? artistsToggle.closest('.multiselect-dropdown').querySelectorAll('.multiselect-checkbox')
            : [];

        artistCheckboxes.forEach(cb => {
            cb.addEventListener('click', function (e) {
                const option = cb.closest('.multiselect-option');
                if (option && option.classList.contains('locked')) {
                    e.preventDefault();
                }
            });
        });

        function setArtistLocked(cb, locked) {
            const option = cb.closest('.multiselect-option');
            if (option) option.classList.toggle('locked', locked);
        }

        function applyAlbumArtists(artistIds) {
            const ids = (artistIds || []).map(String);
            artistCheckboxes.forEach(cb => {

                setArtistLocked(cb, false);

                if (ids.includes(cb.value)) {
                    cb.checked = true;
                    setArtistLocked(cb, true);
                }

                cb.dispatchEvent(new Event('change'));
            });
        }

        function syncTrackNumberVisibility(radio) {
            if (!trackNumberContainer) return;
            const isSingle = radio.value === '';

            trackNumberContainer.classList.toggle('d-none', isSingle);
            trackNumberContainer.classList.toggle('d-flex', !isSingle);

            if (singleCover) {
                singleCover.toggleAttribute('disabled', !isSingle);
            }

            if (isSingle) {
                artistCheckboxes.forEach(cb => setArtistLocked(cb, false));
            }
        }

        // ==============================
        // ALBUM FILTER
        // ==============================
        function getSelectedArtistIds() {
            return Array.from(artistCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        }

        function filterAlbumOptions() {
            const selectedArtistIds = getSelectedArtistIds();
            const albumOptions = dropdown.querySelectorAll('.album-option');
            let currentSelectionStillValid = true;

            albumOptions.forEach(li => {
                const albumArtistIds = (li.dataset.artistIds || '').split(',').filter(Boolean);
                const radio = li.querySelector('.singleselect-radio');

                const matches = selectedArtistIds.length === 0
                    || albumArtistIds.some(id => selectedArtistIds.includes(id));

                li.classList.toggle('filtered-out', !matches);

                if (radio && radio.checked && !matches) {
                    currentSelectionStillValid = false;
                }
            });

            if (!currentSelectionStillValid) {
                const noAlbumRadio = dropdown.querySelector('.singleselect-radio[value=""]');
                if (noAlbumRadio) {
                    noAlbumRadio.checked = true;
                    noAlbumRadio.dispatchEvent(new Event('change'));
                }
            }
        }

        artistCheckboxes.forEach(cb => {
            cb.addEventListener('change', filterAlbumOptions);
        });

        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (!radio.checked) return;

                if (label) {
                    label.textContent = radio.closest('.singleselect-option').querySelector('span').textContent;
                    const albumId = radio.value;

                    if (albumId === '') {
                        uiTracks = [];
                        renderTracklist();
                    } else {
                        const url = `/catalog/tracks/album/${albumId}/`;

                        fetch(url)
                            .then(response => {
                                if (!response.ok) throw new Error(`Error HTTP! State: ${response.status}`);
                                return response.json();
                            })
                            .then(data => {
                                let fetchedTracks = data.tracks || data;

                                applyAlbumArtists(data.artists);

                                fetchedTracks = fetchedTracks.filter(t => String(t.track_id) !== String(currentTrackId));

                                uiTracks = fetchedTracks.map(t => ({ title: t.title, isCurrent: false }));

                                const currentNumber = hiddenTrackNumber && hiddenTrackNumber.value !== ''
                                    ? parseInt(hiddenTrackNumber.value)
                                    : null;

                                let startPos = (currentNumber !== null && !isNaN(currentNumber))
                                    ? fetchedTracks.filter(t => t.track_number < currentNumber).length
                                    : uiTracks.length;

                                if (startPos < 0) startPos = 0;
                                if (startPos > uiTracks.length) startPos = uiTracks.length;

                                uiTracks.splice(startPos, 0, { isCurrent: true });

                                renderTracklist();
                            })
                            .catch(error => console.error("Error:", error));
                    }
                }

                syncTrackNumberVisibility(radio);
            });

            if (radio.checked) {
                syncTrackNumberVisibility(radio);
                if (radio.value !== '') {
                    radio.dispatchEvent(new Event('change'));
                }
            }
        });

        filterAlbumOptions();
    });
});

/* ===========================
   COUNTRY DROPDOWN (Artist form)
   =========================== */
document.addEventListener('DOMContentLoaded', function () {
    const COUNTRY_LIST = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

    document.querySelectorAll('.country-select-dropdown').forEach(function (wrapper) {
        const menu = wrapper.querySelector('.singleselect-menu');
        const label = wrapper.querySelector('.singleselect-toggle-label');
        const currentCountry = wrapper.dataset.currentCountry || '';
        if (!menu || !label) return;

        function buildOption(value, text) {
            const li = document.createElement('li');
            const optLabel = document.createElement('label');
            optLabel.className = 'singleselect-option dropdown-item';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'country';
            input.value = value;
            input.className = 'singleselect-radio';
            if (value === currentCountry) input.checked = true;

            const span = document.createElement('span');
            span.textContent = text;

            optLabel.appendChild(input);
            optLabel.appendChild(span);
            li.appendChild(optLabel);
            menu.appendChild(li);

            input.addEventListener('change', function () {
                if (input.checked) label.textContent = text;
            });
        }

        buildOption('', '— Select country —');
        COUNTRY_LIST.forEach(country => buildOption(country, country));

        if (currentCountry) label.textContent = currentCountry;
    });
});