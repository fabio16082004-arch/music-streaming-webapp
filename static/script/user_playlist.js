/*ADD THE PLAYLIST ID WHEN DELETING OR CHANGING A PLAYLIST*/
document.querySelectorAll("#personal-playlists").forEach(container => {
    container.addEventListener('click', function (e) {
        if (e.target.closest('.trigger-delete')) {
            const playlist = e.target.closest(".result-unit");

            if (playlist) {
                const playlist_id = playlist.dataset.id;
                const hiddenPlaylistInput = document.getElementById("deletePlaylistId");
                hiddenPlaylistInput.value = playlist_id;

                const hiddenUserInput = document.getElementById("deleteUserId");
                if(hiddenUserInput){
                    hiddenUserInput.value = playlist.dataset.userId;
                }
            }
        }
    })
})

document.querySelectorAll("#saved-playlists").forEach(container => {
    container.addEventListener('click', function (e) {
        if (e.target.closest('.trigger-delete')) {
            const playlist = e.target.closest(".result-unit");

            if (playlist) {
                const playlist_id = playlist.dataset.id;
                const hiddenPlaylistInput = document.getElementById("deleteSavedPlaylistId");
                hiddenPlaylistInput.value = playlist_id;

                const hiddenUserInput = document.getElementById("deleteUserId");
                if(hiddenUserInput){
                    hiddenUserInput.value = playlist.dataset.userId;
                }
            }
        }
    })
})

document.querySelectorAll("#personal-playlists").forEach(container => {
    container.addEventListener('click', function (e) {

        if(e.target.closest('.trigger-edit')){
            const playlist = e.target.closest(".result-unit");

            if (playlist) {
                const playlist_id = playlist.dataset.id;
                const hiddenInput = document.getElementById("editPlaylistId");
                hiddenInput.value = playlist_id;
                const playlistDescription = playlist.querySelector(".result-description");
                const h2Element = playlistDescription.querySelector("h2");
                const h3Element = playlistDescription.querySelector("h3");

                const h2Text = h2Element ? h2Element.textContent.trim() : "";
                const h3Text = h3Element ? h3Element.textContent.trim() : "";

                const title = document.getElementById("editPlaylistTitle");
                title.value = h2Text;

                const is_public = document.getElementById("editIsPublic");
                is_public.checked = (h3Text == "Public");

            }
        }
    })
})

document.querySelectorAll("#personal-playlists .result-unit, #saved-playlists .result-unit").forEach(unit => {
    unit.addEventListener('click', function (e) {
        if(e.target.closest(".dropdown")){
            return;
        }

        const href = unit.dataset.href;
        if (href) {
            window.location.href = href;
        }
    });
});