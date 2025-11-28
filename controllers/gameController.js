const DeckController = require('./deckController');

const MAX_CARD = 5;

class GameController {
    helloWorld(_, res) {
        res.status(200).render(`game`);
    }

    async createSession(req, res) {
        const cards = await DeckController.fetchRandomCards(MAX_CARD + 1);
        req.session.game = {
            deck: cards.slice(0, MAX_CARD),
            player: {},
            computer: cards[MAX_CARD],
            state: 'INIT'
        };
        res.redirect('new-game')
    }

    async createNewGame(req, res) {
        if (!req.session.game || req.session.game.state !== 'INIT') {
            res.redirect('init');
            return;
        }
        
        if (req.session.game.deck.length < MAX_CARD) {
            res.redirect('init');
            return;
        }

        req.session.game.state = 'PLAYER_TURN';
        res.status(200).render('game');
    }

    getPlayerCard(req, res) {
        if (!req.session.game) {
            res.status(404).json({ message: 'Invalid game state' });
            return;
        }

        if (req.session.game.state !== 'PLAYER_TURN') {
            res.status(404).json({ message: 'Not your turn' });
            return;
        }

        if (req.session.game.deck.length <= 0) {
            res.status(404).json({ message: 'Not enough card in deck' });
            return;
        }

        const deck = req.session.game.deck;
        const i = Math.floor(Math.random() * deck.length);
        const card = req.session.game.deck.splice(i, 1)[0];

        res.status(200).json({ message: 'Success', card: card });
    }

    postPlayerCard(req, res) {
        if (!req.session.game) {
            res.status(404).json({ message: 'Invalid game state' });
            return;
        }

        if (req.session.game.state !== 'PLAYER_TURN') {
            res.status(404).json({ message: 'Not your turn' });
            return;
        }

        const data = req.body;
        if (!data) {
            res.status(404).json({ message: 'Invalid request' });
            return;
        }

        req.session.game.state = 'COMPUTER_TURN';
        req.session.game.player = data;
        res.status(200).json({ message: 'Success' });
    }

    getComputerCard(req, res) {
        if (!req.session.game) {
            res.status(404).json({ message: 'Invalid game state' });
            return;
        }

        if (req.session.game.state !== 'COMPUTER_TURN') {
            res.status(404).json({ message: 'Not computer turn' });
            return;
        }

        req.session.game.state = 'REVEAL';
        res.status(200).json({
            message: 'Success',
            card: req.session.game.computer
        });
    }

    getRevealWinner(req, res) {
        if (!req.session.game) {
            res.status(404).json({ message: 'Invalid game state' });
            return;
        }

        if (req.session.game.state !== 'REVEAL') {
            res.status(404).json({ message: 'Invalid State' });
            return;
        }
        
        if (!req.session.game.player || !req.session.game.computer) {
            res.status(404).json({ message: 'Invalid game state' })
            return;
        }

        const playerValue = Number.parseInt(req.session.game.player.value);
        const computerValue = Number.parseInt(req.session.game.computer.value);
        req.session.game.state = 'GAME_OVER';
        if (playerValue > computerValue) {
            res.status(200).json({
                message: 'Success',
                winner: 'PLAYER'
            });
        } else if (computerValue > playerValue) {
            res.status(200).json({
                message: 'Success',
                winner: 'COMPUTER'
            });
        } else {
            res.status(200).json({
                message: 'Success',
                winner: 'TIE'
            });
        }
    }
}

module.exports = new GameController();