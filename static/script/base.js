// ==============================
// AUDIO PLAYER
// ==============================
document.addEventListener('click', function (e) {
    if (e.target.closest(".add-to-btn") || e.target.closest(".remove-track-form")) return;

    const song = e.target.closest('.result-unit[data-type="track"]');
    if (!song) return;

    const play_song_div = document.querySelector("footer .play-song");
    play_song_div.classList.remove("d-none");
    play_song_div.classList.add("d-flex");

     const playerHeight = play_song_div.offsetHeight;
    document.documentElement.style.setProperty('--player-height', playerHeight + 'px');

    const audioPlayer = document.getElementById("audioPlayer");
    if (!song.dataset.id) return;

    const cover = song.querySelector(".result-image");
    const title = song.querySelector("h2");
    const artist = song.querySelector("h3");

    const footerImage = document.querySelector(".left-play-song .result-image");
    const footerTitle = document.querySelector(".song-detail h2");
    const footerArtist = document.querySelector(".song-detail h3");

    if (cover && footerImage) footerImage.src = cover.src;
    if (title && footerTitle) footerTitle.textContent = title.textContent;
    if (artist && footerArtist) footerArtist.textContent = artist.textContent;

    audioPlayer.src = song.dataset.audioUrl;
    audioPlayer.play().catch(err => console.error("Playback error:", err));
});
