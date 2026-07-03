// ==============================
// AUDIO PLAYER
// ==============================

const audioPlayer = document.getElementById('audioPlayer');

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// ==============================
// SENDING THE LISTENING LOG
// ==============================

async function startPlaybackSession(trackId) {
    try {
        const response = await fetch(START_LOG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ track_id: trackId })
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            console.error('Error starting playback session:', response.statusText, errorBody);
            return;
        }

        const result = await response.json();
        audioPlayer.dataset.session_token = result.session_token;
    } catch (error) {
        console.error('Network error on start:', error);
    }
}

async function closePlaybackSession() {
    const sessionToken = audioPlayer.dataset.session_token;
    if (!sessionToken) return;

    try {
        const response = await fetch(STOP_LOG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ session_token: sessionToken })
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            console.error('Error stopping playback session:', response.statusText, errorBody);
            return;
        }

        const result = await response.json();
        console.log('Log saved successfully:', result);
    } catch (error) {
        console.error('Network error:', error);
    } finally {
        delete audioPlayer.dataset.session_token;
    }
}

audioPlayer.addEventListener('ended', async function () {
    await closePlaybackSession();
});

// ==============================
// CLICK ON A TRACK
// ==============================

document.addEventListener('click', async function (e) {
    if (e.target.closest(".add-to-btn") || e.target.closest(".remove-track-form")) return;

    const song = e.target.closest('.result-unit[data-type="track"]');
    if (!song) return;
    if (!song.dataset.id) return;

    const play_song_div = document.querySelector("footer .play-song");
    play_song_div.classList.remove("d-none");
    play_song_div.classList.add("d-flex");

    const playerHeight = play_song_div.offsetHeight;
    document.documentElement.style.setProperty('--player-height', playerHeight + 'px');

    await closePlaybackSession();

    audioPlayer.dataset.track_id = song.dataset.id;

    const coverUrl = song.querySelector(".result-image, .suggestion-cover")?.src;
    const title = song.querySelector("h2");
    const artist = song.querySelector("h3");

    const footerImage = document.querySelector(".left-play-song .result-image");
    const footerTitle = document.querySelector(".song-detail h2");
    const footerArtist = document.querySelector(".song-detail h3");

    if (coverUrl && footerImage) footerImage.src = coverUrl;
    if (title && footerTitle) footerTitle.textContent = title.textContent;
    if (artist && footerArtist) footerArtist.textContent = artist.textContent;

    audioPlayer.src = song.dataset.audioUrl;
    audioPlayer.play().catch(err => console.error("Playback error:", err));
});

// ==============================
// LOG INITIALIZATION
// ==============================

audioPlayer.addEventListener('play', async function () {
    console.log('track_id al momento del play:', audioPlayer.dataset.track_id);
    await startPlaybackSession(audioPlayer.dataset.track_id);
});