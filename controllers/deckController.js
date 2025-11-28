const CardModel = require('../models/cardModel');

class DeckController {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getAllByName = this.getAllByName.bind(this);
    }

    async getAll(_, res) {
        const cards = await CardModel.fetchAllCards();
        res.status(200).render('deck', { cards: cards, isSearch: false });
    }

    async getAllByName(req, res) {
        const cards = await CardModel.fetchAllCards();
        let name = req.query.q;
        if (name) name = name.toLowerCase();
        res.status(200)
        res.render('deck', {
            cards: cards.filter(card => card.name.toLowerCase().includes(name)),
            isSearch: true,
            searchVal: name
        })
    }
}

module.exports = new DeckController();