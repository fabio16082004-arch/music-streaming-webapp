//SELECTION OF THE SEARCH FILTER
document.querySelectorAll('.ma-filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.ma-filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

//PLAY A SONG
document.querySelectorAll('.result-unit[data-type="track"]').forEach(songs => {

})