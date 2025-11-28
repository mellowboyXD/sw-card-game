function toggleHelpModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.toggle('show');
}

function flipCard(obj) {
    obj.classList.toggle('flipped');
}

function searchCard() {
    const searchVal = document.getElementById('search');
    if (searchVal.value.trim()) {
        window.location.assign(`/sw-card-game/deck/search?q=${searchVal.value.trim()}`);
    }
}