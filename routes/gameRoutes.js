const express = require('express');
const router = express.Router();

const GameController = require('../controllers/gameController');

router.get('/', (_, res) => res.redirect('game/init'));
router.get('/init', GameController.createSession)
router.get('/new-game', GameController.createNewGame);
router.post('/new-game', GameController.postPlayerCard);
router.get('/get-card', GameController.getPlayerCard);
router.get('/get-computer-card', GameController.getComputerCard);
router.get('/reveal', GameController.getRevealWinner);

module.exports = router;