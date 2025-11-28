const INIT = 0;
const PLAYER = 1;
const COMPUTER = 2;
const REVEAL = 3;
const GAME_OVER = 4;
const GAME_STATES = ['INIT', 'PLAYER_TURN', 'COMPUTER_TURN', 'REVEAL', 'GAME_OVER'];

let currentState = INIT;
let cardData = null;
let winner = null;

window.onload = function () {
    currentState = (currentState + 1) % GAME_STATES.length;
}

async function drawPlayerCard() {
    const deck = document.getElementById('player-deck');
    const card = deck.lastElementChild;
    const overlay = document.getElementById('overlay');
    const overlayCard = document.getElementById('overlay-card');

    if (currentState !== PLAYER) {
        return;
    }

    await fetch('/sw-card-game/game/get-card')
        .then(res => res.json())
        .then((data) => {
            if (data.message === 'Success') {
                cardData = data.card;
            }
        })
        .catch(err => console.error(err));

    if (!cardData) {
        alert('Something went wrong!');
        return;
    }

    requestAnimationFrame(() => {
        card.classList.toggle('draw-card');
    });
    
    setTimeout(() => {
        requestAnimationFrame(() => {
            card.classList.toggle('slide');
        });
    }, 320);
    
    setTimeout(() => {
        deck.removeChild(card);
        overlayCard.innerHTML = `
            <div class="card" onclick="this.classList.toggle('flipped')">
                <div class="card-inner">
                    <div class="card-front pad-sm" data-card-id="${cardData.id}"'>
                        <div class="card-header">
                            <div class="card-number">${cardData.value}</div>
                            <div class="card-name">${cardData.name}</div>
                        </div>
                        <div class="card-avatar">
                            <img src="${cardData.image}" alt="Character image">
                        </div>
                        <div class="card-section label-bar">${cardData.title}</div>
                        <div class="card-footer">
                            <span>${cardData.homeworld}</span>
                            <span>${cardData.specie}</span>
                        </div>
                    </div>
                    <div class="card-back pad-sm">
                    </div>
                </div>
            </div>
        `;
        overlay.classList.add('show');
    }, 821);
}

async function drawOpponentCard() {
    const deck = document.getElementById('opponent-deck');
    const card = deck.lastElementChild;
    const opponentWarZone = document.getElementById('opponent-war-zone');

    let opponentCardData = null;
    await fetch('/sw-card-game/game/get-computer-card')
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Success')
                opponentCardData = data.card;
        })
        .catch(err => console.error(err));

    if (currentState !== COMPUTER)
        return;

    if (!opponentCardData) {
        alert("Something went wrong");
        return;
    }
    
    requestAnimationFrame(() => {
        card.classList.toggle('draw-card');
    });

    setTimeout(() => {
        requestAnimationFrame(() => {
            card.classList.toggle('slide');
        });
    }, 320);

    setTimeout(() => {
        deck.removeChild(card);
        opponentWarZone.innerHTML = `
            <div class="card flipped" style="pointer-events: none">
                <div class="card-inner">
                    <div class="card-front pad-sm" data-card-id="${opponentCardData.id}"'>
                        <div class="card-header">
                            <div class="card-number">${opponentCardData.value}</div>
                            <div class="card-name">${opponentCardData.name}</div>
                        </div>
                        <div class="card-avatar">
                            <img src="${opponentCardData.image}" alt="Character image">
                        </div>
                        <div class="card-section label-bar">${opponentCardData.title}</div>
                        <div class="card-footer">
                            <span>${opponentCardData.homeworld}</span>
                            <span>${opponentCardData.specie}</span>
                        </div>
                    </div>
                    <div class="card-back pad-sm">
                    </div>
                </div>
            </div>
        `;
    }, 821);
}

function drawAnotherCard() {
    const overlay = document.getElementById('overlay');
    const overlayCard = document.getElementById('overlay-card');
    const deck = document.getElementById('player-deck');

    if (deck.childElementCount <= 0)
        return;
    
    overlay.classList.remove('show');
    overlayCard.innerHTML = '';
    setTimeout(() => {
        drawPlayerCard();
    }, 200);
}

function confirmCard() {
    const overlay = document.getElementById('overlay');
    const overlayCard = document.getElementById('overlay-card');
    const drawBtn = document.getElementById('draw-card-btn');
    const playerWarZone = document.getElementById('player-war-zone');

    overlay.classList.remove('show');
    const card = overlayCard.removeChild(overlayCard.lastElementChild);
    if(!card.classList.contains('flipped'))
        card.classList.add('flipped');
    card.style.pointerEvents = 'none';
    playerWarZone.appendChild(card);
    drawBtn.classList.add('disable')

    currentState = (currentState + 1) % GAME_STATES.length;
}

async function nextState(event) {
    if (currentState === REVEAL) {
        await revealCards();
        event.innerText = 'End Round';
        return;
    }

    if (currentState > REVEAL) {
        endRound();
        return;
    }

    if (!cardData) {
        alert('Choose a card');
        return;
    }

    await fetch('/sw-card-game/game/new-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData)
    })
        .then(res => res.json())
        .then(data => {
            if (data.message !== 'Success') {
                console.error('Something went wront', data.message);
                return;
            }
        })
        .catch(err => console.error(err));

    await drawOpponentCard();

    currentState = (currentState + 1) % GAME_STATES.length;
    if (currentState === REVEAL)
        event.innerText = 'Reveal';
}

async function revealCards() {
    const playerWarZone = document.getElementById('player-war-zone');
    const opponentWarZone = document.getElementById('opponent-war-zone');

    const playerCard = playerWarZone.lastElementChild;
    const computerCard = opponentWarZone.lastElementChild;

    await fetch('/sw-card-game/game/reveal')
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Success') {
                winner = data.winner;
            }
        })
        .catch(err => console.error(err));
    if (!winner) {
        console.error('Something went wrong!');
        return;
    }

    requestAnimationFrame(() => {
        playerCard.classList.remove('flipped');
        computerCard.classList.remove('flipped');

        if (winner === 'PLAYER') {
            playerWarZone.classList.add('winner');
        }
        else if (winner === 'COMPUTER') {
            opponentWarZone.classList.add('winner');
        }
    });
    currentState = (currentState + 1) % GAME_STATES.length;
    setTimeout(endRound, 300);
}

function endRound() {
    if (currentState !== GAME_OVER) 
        return;

    const gameOverOverlay = document.getElementById('game-over-overlay');
    const content = document.getElementById('game-over-content');
    setTimeout(() => {
        requestAnimationFrame(() => {
            content.innerHTML = (winner === 'PLAYER') ? '<h1>You Won!</h1>' : (winner === 'COMPUTER') ? '<h1>You lost!</h1>' : `<h1>It's a tie!</h1>`
            gameOverOverlay.classList.add('show');
        });
    }, 300)
}