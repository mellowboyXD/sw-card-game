const session = require('express-session');
const express = require('express');
const path = require('path');
const app = express();

const indexRoutes = require('./routes/indexRoutes');
const deckRoutes = require('./routes/deckRoutes');
const gameRoutes = require('./routes/gameRoutes');

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2
    }
}));

app.use(express.json());
app.use('/sw-card-game', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/sw-card-game', indexRoutes);
app.use('/sw-card-game/index', indexRoutes);

app.use('/sw-card-game/deck', deckRoutes);

app.use('/sw-card-game/game', gameRoutes);

app.listen(42069, () => {
    console.log('Server running at http://localhost:42069/');
});