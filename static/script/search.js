
const filterState = {
  track:  { genre: '', duration: { min: '', sec: '' }, year: '', explicit: null },
  album:  { genre: '', year: '' },
  artist: { initial: null, country: '' },
};

tempState = {};



// ==============================
// FILTER BUTTON SELECTION
// ==============================
document.querySelectorAll('.ma-filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.ma-filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const category = this.dataset.category;

    const filterBtn = document.querySelector('.adv-filter-btn');
    if (category !== 'all' && category !== 'playlist') {
      filterBtn.style.display = 'flex';
    } else {
      filterBtn.style.display = 'none';
    }

    searchElements();
  });
});

// ==============================
// OPEN MODAL
// ==============================
document.querySelector('.adv-filter-btn').addEventListener('click', function() {
  const activeBtn = document.querySelector('.ma-filter-btn.active');
  const category = activeBtn ? activeBtn.dataset.category : null;
  const modalBody = document.querySelector('.modal-body');

  tempState = JSON.parse(JSON.stringify(filterState[category]));

  switch (category) {
    case 'track':  modalBody.innerHTML = buildTrackFilters(tempState);  break;
    case 'album':  modalBody.innerHTML = buildAlbumFilters(tempState);  break;
    case 'artist': modalBody.innerHTML = buildArtistFilters(tempState); break;
    default: modalBody.innerHTML = '';
  }

  bindInteractions(category);
});

//===============================
// SEARCH AFTER USING THE NAVBAR
//===============================
let timer;
document.querySelector('.search-bar input').addEventListener('input', function(){
  clearTimeout(timer);

  timer = setTimeout(() => {
    const activeBtn = document.querySelector('.ma-filter-btn.active');
    const category = activeBtn ? activeBtn.dataset.category : null;
    if (category) {
      filterState[category] = JSON.parse(JSON.stringify(tempState));
    }
  searchElements();
  }, 300);

})

// ==============================
// APPLY
// ==============================
document.querySelector('.modal-footer .btn-secondary').addEventListener('click', function() {
  const activeBtn = document.querySelector('.ma-filter-btn.active');
  const category = activeBtn ? activeBtn.dataset.category : null;
  if (category) {
    filterState[category] = JSON.parse(JSON.stringify(tempState));
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById('filters'));
  if (modal) modal.hide();

  searchElements();
});

// ==============================
// GENRE SELECT
// ==============================
function genreSelect(id, selectedValue) {
  const btn = document.querySelector(".adv-filter-btn")
  const rawGenres = btn.dataset.genres;

const genres = (typeof rawGenres !== 'undefined') ? JSON.parse(rawGenres) : ['Pop','Rock','Hip-Hop','Jazz','Classical','Electronic','R&B','Country','Metal','Folk','Reggae','Blues'];
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
        <button class="filter-chip ${s.explicit === 'no'  ? 'selected' : ''}" data-value="no">No</button>
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
  const countries = ['United States','United Kingdom','Italy','France','Germany','Canada','Australia','Brazil','Japan','Nigeria','Sweden','Spain','Jamaica','South Korea','Colombia'];
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

function bindInteractions(category) {
  const s = tempState;

  document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function() {
      if (category === 'track'  && this.id === 'track-genre')    s.genre   = this.value;
      if (category === 'album'  && this.id === 'album-genre')    s.genre   = this.value;
      if (category === 'artist' && this.id === 'artist-country') s.country = this.value;
    });
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      const siblings = this.closest('.filter-chips').querySelectorAll('.filter-chip');
      siblings.forEach(c => c.classList.remove('selected'));
      this.classList.toggle('selected');

      const groupId = this.closest('.filter-group').id;
      const value = this.classList.contains('selected') ? this.dataset.value : null;

      if (category === 'track'  && groupId === 'fg-explicit') s.explicit = value;
      if (category === 'artist' && groupId === 'fg-initial')  s.initial  = value;
    });
  });

  document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('input', function() {
      if (this.value !== '' && this.max && parseInt(this.value) > parseInt(this.max)) this.value = this.max;
      if (this.value !== '' && this.min && parseInt(this.value) < parseInt(this.min)) this.value = this.min;

      if (category === 'track') {
        if (this.id === 'dur-min')    s.duration.min = this.value;
        if (this.id === 'dur-sec')    s.duration.sec = this.value;
        if (this.id === 'track-year') s.year         = this.value;
      }
      if (category === 'album' && this.id === 'album-year') s.year = this.value;
    });
  });

  document.querySelectorAll('.filter-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const groupId = this.dataset.target;
      const group = document.getElementById(groupId);
      if (!group) return;

      group.querySelectorAll('.filter-select').forEach(sel => sel.value = '');
      group.querySelectorAll('.filter-input').forEach(inp => inp.value = '');
      group.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('selected'));

      if (category === 'track') {
        if (groupId === 'fg-genre')    s.genre    = '';
        if (groupId === 'fg-duration') s.duration = { min: '', sec: '' };
        if (groupId === 'fg-year')     s.year     = '';
        if (groupId === 'fg-explicit') s.explicit = null;
      }
      if (category === 'album') {
        if (groupId === 'fg-genre') s.genre = '';
        if (groupId === 'fg-year')  s.year  = '';
      }
      if (category === 'artist') {
        if (groupId === 'fg-initial') s.initial = null;
        if (groupId === 'fg-country') s.country = '';
      }
    });
  });
}

function searchElements(){
  const activeBtn = document.querySelector('.ma-filter-btn.active');
  const category = activeBtn?.dataset.category;
  const query = document.querySelector('.search-bar input').value.trim();
  const s = (category == 'all') ?  {} : filterState[category];

  const params = new URLSearchParams({ q: query, category });

  if (category === 'track') {
    if (s.genre)            params.append('genre', s.genre);
    if (s.duration.min)     params.append('duration_min', s.duration.min);
    if (s.duration.sec)     params.append('duration_sec', s.duration.sec);
    if (s.year)             params.append('year', s.year);
    if (s.explicit !== null) params.append('explicit', s.explicit);
  }
  if (category === 'album') {
    if (s.genre) params.append('genre', s.genre);
    if (s.year)  params.append('year', s.year);
  }
  if (category === 'artist') {
    if (s.initial) params.append('initial', s.initial);
    if (s.country) params.append('country', s.country);
  }

  fetch(`/catalog/search/results/?${params}`)
    .then(res => res.text())
    .then(html => {
      document.querySelector('.results').innerHTML = html;
    })
    .catch(err => console.error('Search failed:', err));
}

document.querySelectorAll('.result-unit[data-type="track"]').forEach(songs => {

});