const express = require('express');
const router = express.Router();

const DeckController = require('../controllers/deckController');

router.get('/', DeckController.getAll);
router.get('/search', DeckController.getAllByName);

module.exports = router;