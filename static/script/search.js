const filterState = {
    track: {genre: '', duration: {min: '', sec: ''}, year: '', explicit: null},
    album: {genre: '', year: ''},
    artist: {initial: null, country: ''},
};

let tempState = {};


// ==============================
// FILTER BUTTON SELECTION
// ==============================
document.querySelectorAll('.ma-filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.ma-filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const category = this.dataset.category;

        const filterBtn = document.querySelector('.adv-filter-btn');
        if (filterBtn) {
            filterBtn.style.display = (category !== 'all' && category !== 'playlist') ? 'flex' : 'none';
        }

        searchElements();
    });
});


// ==============================
// OPEN MODAL
// ==============================
const advFilterBtn = document.querySelector('.adv-filter-btn');
if (advFilterBtn) {
    advFilterBtn.addEventListener('click', function () {
        const activeBtn = document.querySelector('.ma-filter-btn.active');
        const category = activeBtn ? activeBtn.dataset.category : null;
        const modalBody = document.querySelector('.modal-body');

        tempState = JSON.parse(JSON.stringify(filterState[category]));

        switch (category) {
            case 'track':
                modalBody.innerHTML = buildTrackFilters(tempState);
                break;
            case 'album':
                modalBody.innerHTML = buildAlbumFilters(tempState);
                break;
            case 'artist':
                modalBody.innerHTML = buildArtistFilters(tempState);
                break;
            default:
                modalBody.innerHTML = '';
        }

        bindInteractions(category);
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
            const activeBtn = document.querySelector('.ma-filter-btn.active');
            const category = activeBtn ? activeBtn.dataset.category : null;
            if (category && filterState[category]) {
                filterState[category] = JSON.parse(JSON.stringify(tempState));
            }
            searchElements();
        }, 300);
    });
}


// ==============================
// APPLY FILTERS
// ==============================
const applyBtn = document.querySelector('.modal-footer .btn-secondary');
if (applyBtn) {
    applyBtn.addEventListener('click', function () {
        const activeBtn = document.querySelector('.ma-filter-btn.active');
        const category = activeBtn ? activeBtn.dataset.category : null;
        if (category && filterState[category]) {
            filterState[category] = JSON.parse(JSON.stringify(tempState));
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('filters'));
        if (modal) modal.hide();
        searchElements();
    });
}


// ==============================
// GENRE SELECT
// ==============================
function genreSelect(id, selectedValue) {
    const btn = document.querySelector('.adv-filter-btn');
    const rawGenres = btn ? btn.dataset.genres : undefined;
    const genres = (typeof rawGenres !== 'undefined')
        ? JSON.parse(rawGenres)
        : ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Metal', 'Folk', 'Reggae', 'Blues'];

    return `
    <select class="filter-select" id="${id}">
      <option value="">— Select genre —</option>
      ${genres.map(g => `<option value="${g}" ${selectedValue === g ? 'selected' : ''}>${g}</option>`).join('')}
    </select>`;
}


// ==============================
// TRACK FILTERS
// ==============================
function buildTrackFilters(s) {
    const currentYear = new Date().getFullYear();
    return `
    <div class="filter-group" id="fg-genre">
      <div class="filter-label-row">
        <label class="filter-label">Genre</label>
        <button class="filter-remove" data-target="fg-genre">✕ Remove</button>
      </div>
      ${genreSelect('track-genre', s.genre)}
    </div>

    <div class="filter-group" id="fg-duration">
      <div class="filter-label-row">
        <label class="filter-label">Max duration</label>
        <button class="filter-remove" data-target="fg-duration">✕ Remove</button>
      </div>
      <div class="filter-duration">
        <input type="number" class="filter-input" id="dur-min" min="0" max="59" placeholder="mm" value="${s.duration.min}">
        <span class="filter-sep">:</span>
        <input type="number" class="filter-input" id="dur-sec" min="0" max="59" placeholder="ss" value="${s.duration.sec}">
      </div>
    </div>

    <div class="filter-group" id="fg-year">
      <div class="filter-label-row">
        <label class="filter-label">Release year</label>
        <button class="filter-remove" data-target="fg-year">✕ Remove</button>
      </div>
      <input type="number" class="filter-input full" id="track-year" min="1900" max="${currentYear}" placeholder="e.g. 2019" value="${s.year}">
    </div>

    <div class="filter-group" id="fg-explicit">
      <div class="filter-label-row">
        <label class="filter-label">Explicit</label>
        <button class="filter-remove" data-target="fg-explicit">✕ Remove</button>
      </div>
      <div class="filter-chips">
        <button class="filter-chip ${s.explicit === 'yes' ? 'selected' : ''}" data-value="yes">Yes</button>
        <button class="filter-chip ${s.explicit === 'no' ? 'selected' : ''}" data-value="no">No</button>
      </div>
    </div>`;
}


// ==============================
// ALBUM FILTERS
// ==============================
function buildAlbumFilters(s) {
    const currentYear = new Date().getFullYear();
    return `
    <div class="filter-group" id="fg-genre">
      <div class="filter-label-row">
        <label class="filter-label">Genre</label>
        <button class="filter-remove" data-target="fg-genre">✕ Remove</button>
      </div>
      ${genreSelect('album-genre', s.genre)}
    </div>

    <div class="filter-group" id="fg-year">
      <div class="filter-label-row">
        <label class="filter-label">Release year</label>
        <button class="filter-remove" data-target="fg-year">✕ Remove</button>
      </div>
      <input type="number" class="filter-input full" id="album-year" min="1900" max="${currentYear}" placeholder="e.g. 2019" value="${s.year}">
    </div>`;
}


// ==============================
// ARTIST FILTERS
// ==============================
function buildArtistFilters(s) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const countries = ['United States', 'United Kingdom', 'Italy', 'France', 'Germany', 'Canada', 'Australia', 'Brazil', 'Japan', 'Nigeria', 'Sweden', 'Spain', 'Jamaica', 'South Korea', 'Colombia'];
    return `
    <div class="filter-group" id="fg-initial">
      <div class="filter-label-row">
        <label class="filter-label">Name initial</label>
        <button class="filter-remove" data-target="fg-initial">✕ Remove</button>
      </div>
      <div class="filter-chips filter-chips--letters">
        ${letters.map(l => `<button class="filter-chip ${s.initial === l ? 'selected' : ''}" data-value="${l}">${l}</button>`).join('')}
      </div>
    </div>

    <div class="filter-group" id="fg-country">
      <div class="filter-label-row">
        <label class="filter-label">Country</label>
        <button class="filter-remove" data-target="fg-country">✕ Remove</button>
      </div>
      <select class="filter-select" id="artist-country">
        <option value="">— Select country —</option>
        ${countries.map(c => `<option value="${c}" ${s.country === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>`;
}


// ==============================
// BIND FILTER INTERACTIONS
// ==============================
function bindInteractions(category) {
    const s = tempState;

    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', function () {
            if (category === 'track' && this.id === 'track-genre') s.genre = this.value;
            if (category === 'album' && this.id === 'album-genre') s.genre = this.value;
            if (category === 'artist' && this.id === 'artist-country') s.country = this.value;
        });
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            const siblings = this.closest('.filter-chips').querySelectorAll('.filter-chip');
            siblings.forEach(c => c.classList.remove('selected'));
            this.classList.toggle('selected');

            const groupId = this.closest('.filter-group').id;
            const value = this.classList.contains('selected') ? this.dataset.value : null;

            if (category === 'track' && groupId === 'fg-explicit') s.explicit = value;
            if (category === 'artist' && groupId === 'fg-initial') s.initial = value;
        });
    });

    document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('input', function () {
            if (this.value !== '' && this.max && parseInt(this.value) > parseInt(this.max)) this.value = this.max;
            if (this.value !== '' && this.min && parseInt(this.value) < parseInt(this.min)) this.value = this.min;

            if (category === 'track') {
                if (this.id === 'dur-min') s.duration.min = this.value;
                if (this.id === 'dur-sec') s.duration.sec = this.value;
                if (this.id === 'track-year') s.year = this.value;
            }
            if (category === 'album' && this.id === 'album-year') s.year = this.value;
        });
    });

    document.querySelectorAll('.filter-remove').forEach(btn => {
        btn.addEventListener('click', function () {
            const groupId = this.dataset.target;
            const group = document.getElementById(groupId);
            if (!group) return;

            group.querySelectorAll('.filter-select').forEach(sel => sel.value = '');
            group.querySelectorAll('.filter-input').forEach(inp => inp.value = '');
            group.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('selected'));

            if (category === 'track') {
                if (groupId === 'fg-genre') s.genre = '';
                if (groupId === 'fg-duration') s.duration = {min: '', sec: ''};
                if (groupId === 'fg-year') s.year = '';
                if (groupId === 'fg-explicit') s.explicit = null;
            }
            if (category === 'album') {
                if (groupId === 'fg-genre') s.genre = '';
                if (groupId === 'fg-year') s.year = '';
            }
            if (category === 'artist') {
                if (groupId === 'fg-initial') s.initial = null;
                if (groupId === 'fg-country') s.country = '';
            }
        });
    });
}


// ==============================
// SEARCH ELEMENTS
// ==============================
function searchElements() {
    const activeBtn = document.querySelector('.ma-filter-btn.active');
    const category = activeBtn?.dataset.category;
    const searchBar = document.querySelector('.search-bar input');
    const query = searchBar ? searchBar.value.trim() : '';
    const s = (category === 'all') ? {} : filterState[category];

    const params = new URLSearchParams({q: query, category});

    if (category === 'track') {
        if (s.genre) params.append('genre', s.genre);
        const min = parseInt(s.duration.min) || 0;
        const sec = parseInt(s.duration.sec) || 0;
        const totalSeconds = (min * 60) + sec;
        if (totalSeconds > 0) params.append('max_duration', totalSeconds);
        if (s.year) params.append('year', s.year);
        if (s.explicit === 'yes') params.append('explicit', 'true');
        else if (s.explicit === 'no') params.append('explicit', 'false');
    }
    if (category === 'album') {
        if (s.genre) params.append('genre', s.genre);
        if (s.year) params.append('year', s.year);
    }
    if (category === 'artist') {
        if (s.initial) params.append('stage_name_initial', s.initial);
        if (s.country) params.append('country', s.country);
    }

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

    void alertBox.offsetHeight; // forza reflow per la transizione CSS

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