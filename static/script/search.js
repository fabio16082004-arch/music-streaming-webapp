// ==============================
// CATEGORY SWITCH
// ==============================
function updateFilterButtonVisibility(category) {
    ['track', 'album', 'artist'].forEach(cat => {
        const btn = document.getElementById(`${cat}-filter-btn`);
        if (btn) btn.style.display = (cat === category) ? 'flex' : 'none';
    });
}

document.querySelectorAll('.ma-filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.ma-filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const category = this.dataset.category;

        updateFilterButtonVisibility(category);

        searchElements();
    });
});

updateFilterButtonVisibility(document.querySelector('.ma-filter-btn.active')?.dataset.category);


// ==============================
// GENRE SELECTS
// ==============================
document.querySelectorAll('[data-genres-source]').forEach(select => {
    (DB_GENRES || []).forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        select.appendChild(option);
    });
});


// ==============================
// COUNTRY SELECT
// ==============================
document.querySelectorAll('[data-countries-source]').forEach(select => {
    (COUNTRY_LIST || []).forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
    });
});


// ==============================
// FILTER CHIPS
// ==============================
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function () {
        const siblings = this.closest('.filter-chips').querySelectorAll('.filter-chip');
        const wasSelected = this.classList.contains('selected');
        siblings.forEach(c => c.classList.remove('selected'));
        if (!wasSelected) this.classList.add('selected');
    });
});


// ==============================
// FILTER INPUT
// ==============================
document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('input', function () {
        if (this.value !== '' && this.max && parseInt(this.value) > parseInt(this.max)) this.value = this.max;
        if (this.value !== '' && this.min && parseInt(this.value) < parseInt(this.min)) this.value = this.min;
    });
});


// ==============================
// FILTER REMOVE
// ==============================
document.querySelectorAll('.filter-remove').forEach(btn => {
    btn.addEventListener('click', function () {
        const groupId = this.dataset.target;
        const group = document.getElementById(groupId);
        if (!group) return;

        group.querySelectorAll('.filter-select').forEach(sel => sel.value = '');
        group.querySelectorAll('.filter-input').forEach(inp => inp.value = '');
        group.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('selected'));
    });
});


// ==============================
// APPLY FILTERS
// ==============================
document.querySelectorAll('[data-apply-category]').forEach(btn => {
    btn.addEventListener('click', function () {
        const modalEl = this.closest('.modal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();
        searchElements();
    });
});


// ==============================
// DELETE RESOURCE MODAL — imposta dinamicamente action e nome risorsa
// ==============================
const deleteResourceModal = document.getElementById('deleteResourceModal');
if (deleteResourceModal) {
    deleteResourceModal.addEventListener('show.bs.modal', function (event) {
        const trigger = event.relatedTarget;
        if (!trigger) return;

        const form = document.getElementById('deleteResourceForm');
        const nameEl = document.getElementById('deleteResourceName');

        if (form && trigger.dataset.url) {
            form.action = trigger.dataset.url;
        }
        if (nameEl) {
            nameEl.textContent = trigger.dataset.name || 'this item';
        }
    });
}


// ==============================
// SEARCH INPUT
// ==============================
let timer;
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            searchElements();
        }, 300);
    });
}


// ==============================
// SEARCH ELEMENTS
// ==============================
function readTrackFilters(params) {
    const genre = document.getElementById('track-genre')?.value;
    const min = parseInt(document.getElementById('dur-min')?.value) || 0;
    const sec = parseInt(document.getElementById('dur-sec')?.value) || 0;
    const year = document.getElementById('track-year')?.value;
    const explicitChip = document.querySelector('#trackFiltersModal .filter-chip.selected');

    if (genre) params.append('genre', genre);
    const totalSeconds = (min * 60) + sec;
    if (totalSeconds > 0) params.append('max_duration', totalSeconds);
    if (year) params.append('year', year);
    if (explicitChip) {
        params.append('explicit', explicitChip.dataset.value === 'yes' ? 'true' : 'false');
    }
}

function readAlbumFilters(params) {
    const genre = document.getElementById('album-genre')?.value;
    const year = document.getElementById('album-year')?.value;

    if (genre) params.append('genre', genre);
    if (year) params.append('year', year);
}

function readArtistFilters(params) {
    const initialChip = document.querySelector('#artistFiltersModal .filter-chip.selected');
    const country = document.getElementById('artist-country')?.value;

    if (initialChip) params.append('stage_name_initial', initialChip.dataset.value);
    if (country) params.append('country', country);
}

function searchElements() {
    const activeBtn = document.querySelector('.ma-filter-btn.active');
    const category = activeBtn?.dataset.category;
    const searchBar = document.querySelector('.search-bar input');
    const query = searchBar ? searchBar.value.trim() : '';

    const params = new URLSearchParams({q: query, category});

    if (category === 'track') readTrackFilters(params);
    if (category === 'album') readAlbumFilters(params);
    if (category === 'artist') readArtistFilters(params);

    fetch(`/catalog/search/results/?${params}`)
        .then(res => res.text())
        .then(html => {
            const resultsDiv = document.querySelector('.results');
            if (resultsDiv) resultsDiv.innerHTML = html;
        })
        .catch(err => console.error('Search failed:', err));
}


// ==============================
// ADD SONG TO PLAYLIST
// ==============================
document.addEventListener('click', async function (e) {
    const clickedElement = e.target.closest('.trigger-add-song');
    if (!clickedElement) return;

    e.preventDefault();

    const playlistId = clickedElement.getAttribute('data-id');
    const songId = clickedElement.getAttribute('data-song-id');
    const fetchUrl = clickedElement.getAttribute('data-url');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    clickedElement.disabled = true;

    try {
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({playlist_id: playlistId, song_id: songId})
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast(data.message, 'success');
        } else if (response.status === 409) {
            showToast(data.error, 'warning');
        } else {
            showToast(data.error || 'Unexpected error.', 'danger');
        }

    } catch (error) {
        console.error('Fetch error:', error);
        showToast('Network error. Please try again.', 'danger');
    } finally {
        clickedElement.disabled = false;
    }
});


// ==============================
// SAVE PLAYLIST
// ==============================
document.addEventListener('click', async function (e) {
    const clickedElement = e.target.closest('.trigger-save-playlist');
    if (!clickedElement) return;

    e.preventDefault();

    const playlistId = clickedElement.getAttribute('data-playlist-id');
    const fetchUrl = clickedElement.getAttribute('data-url');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    clickedElement.disabled = true;

    try {
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({playlist_id: playlistId})
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast(data.message, 'success');
            clickedElement.querySelector('i').classList.replace('fa-plus', 'fa-check');
        } else if (response.status === 409) {
            showToast(data.error, 'warning');
        } else {
            showToast(data.error || 'Unexpected error.', 'danger');
        }

    } catch (error) {
        console.error('Fetch error:', error);
        showToast('Network error. Please try again.', 'danger');
    } finally {
        clickedElement.disabled = false;
    }
});


// ==============================
// SHOW TOAST
// ==============================
function showToast(message, type = 'success') {
    const alertBox = document.getElementById('playlist-alert');
    if (!alertBox) return;

    alertBox.classList.remove('alert-success', 'alert-warning', 'alert-danger', 'show', 'd-none');

    if (type === 'success') alertBox.classList.add('alert-success');
    else if (type === 'warning') alertBox.classList.add('alert-warning');
    else alertBox.classList.add('alert-danger');

    alertBox.textContent = message;

    void alertBox.offsetHeight;

    alertBox.classList.add('show');

    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => alertBox.classList.add('d-none'), 300);
    }, 3000);
}


// ==============================
// AUDIO PLAYER
// ==============================
document.addEventListener('click', function (e) {
    if (e.target.closest('.add-to-btn') || e.target.closest('.remove-track-form')) return;

    const song = e.target.closest('.result-unit[data-type="track"]');
    if (!song) return;

    const playSongDiv = document.querySelector('footer .play-song');
    if (!playSongDiv) return;

    playSongDiv.classList.remove('d-none');
    playSongDiv.classList.add('d-flex');

    const playerHeight = playSongDiv.offsetHeight;
    document.documentElement.style.setProperty('--player-height', playerHeight + 'px');

    const audioPlayer = document.getElementById('audioPlayer');
    if (!song.dataset.id || !audioPlayer) return;

    const title = song.querySelector('h2');
    const artist = song.querySelector('h3');
    const coverUrl = song.dataset.coverUrl || song.querySelector('.result-image')?.src;

    const footerImage = document.querySelector('.left-play-song .result-image');
    const footerTitle = document.querySelector('.song-detail h2');
    const footerArtist = document.querySelector('.song-detail h3');

    if (coverUrl && footerImage) footerImage.src = coverUrl;
    if (title && footerTitle) footerTitle.textContent = title.textContent;
    if (artist && footerArtist) footerArtist.textContent = artist.textContent;

    audioPlayer.src = song.dataset.audioUrl;
    audioPlayer.play().catch(err => console.error('Playback error:', err));
});


// ==============================
// CLICK ON ALBUM / ARTIST
// ==============================
const resultsDiv = document.querySelector('.results');
if (resultsDiv) {
    resultsDiv.addEventListener('click', function (e) {
        if (e.target.closest('.add-to-btn')) return;

        const selectedElement = e.target.closest('.result-unit');
        if (!selectedElement) return;

        const type = selectedElement.dataset.type;

        if (type === 'album') {
            const albumId = selectedElement.dataset.id;
            window.location.href = `/catalog/album/${albumId}/`;
        }

        if (type === 'artist') {
            const artistId = selectedElement.dataset.id;
            window.location.href = `/catalog/artist/${artistId}/`;
        }

        if (type === 'playlist') {
            const playlistId = selectedElement.dataset.id;
            window.location.href = `/me/playlists/${playlistId}/`
        }
    });
}