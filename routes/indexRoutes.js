const express = require('express');
const router = express.Router();

const IndexController = require('../controllers/indexController');

router.get('/', (_, res) => res.redirect('index'));
router.get('/index', IndexController.getPage);

module.exports = router;