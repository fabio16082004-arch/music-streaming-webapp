   const genreDeleteForm = document.getElementById('genre-delete-form');
        const genreSelect = document.getElementById('genre-to-delete');
        const genreDeleteTrigger = document.getElementById('genre-delete-trigger');
        const deleteGenreModalEl = document.getElementById('deleteGenreModal');
        const deleteGenreName = document.getElementById('deleteGenreName');
        const confirmGenreDelete = document.getElementById('confirm-genre-delete');

        if (genreDeleteTrigger && genreSelect && deleteGenreModalEl) {
            genreDeleteTrigger.addEventListener('click', function (e) {
                if (!genreSelect.value) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                if (deleteGenreName) {
                    deleteGenreName.textContent = genreSelect.options[genreSelect.selectedIndex].textContent;
                }
            });
        }

        if (confirmGenreDelete && genreDeleteForm && genreSelect) {
            confirmGenreDelete.addEventListener('click', function () {
                genreDeleteForm.action = genreSelect.value;
                genreDeleteForm.submit();
            });
        }