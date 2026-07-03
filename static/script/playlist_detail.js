   // Filter tracks by name as the user types
    document.getElementById('track-search-input').addEventListener('input', function (e) {
        const query = e.target.value.trim().toLowerCase();
        document.querySelectorAll('#playlist-tracks .result-unit').forEach(function (row) {
            const name = row.dataset.name || '';
            row.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

document.addEventListener('DOMContentLoaded', () => {
    const removeForms = document.querySelectorAll('.remove-track-form');

    removeForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const url = this.action;
            const csrfToken = this.querySelector('[name=csrfmiddlewaretoken]').value;

            const trackContainer = this.closest('.result-unit');

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    }
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    trackContainer.style.transition = 'all 0.3s ease';
                    trackContainer.style.opacity = '0';
                    trackContainer.style.transform = 'scale(0.95)';

                    setTimeout(() => {
                        trackContainer.remove();
                    }, 300);
                } else {
                    console.error('Error during the deleting:', data.message);
                }
            } catch (error) {
                console.error('Execution error:', error);
            }
        });
    });
});