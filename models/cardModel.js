const SwapiService = require('../services/swapiService');
const ImageApiService = require('../services/imageApiService');

class CardModel {
    constructor() {
        this.fetchAllCards = this.fetchAllCards.bind(this);
        this.fetchCard = this.fetchCard.bind(this);
        this.fetchRandomCards = this.fetchRandomCards.bind(this);
        this.getIdFromUrl = this.getIdFromUrl.bind(this);
        this.getValue = this.getValue.bind(this);
    }

    async fetchAllCards() {
        const data = await SwapiService.getAllCharacters();
        const cards = await Promise.all(
            data.map(async (character) => {
                const id = this.getIdFromUrl(character.url);
                const homeworld = await SwapiService.getHomeworld(id);
                const specie = (!character.species[0]) ? 'Human' : await SwapiService.getSpecies(id);

                const value = () => {
                    if (character.mass === 'unknown')
                        return this.getValue(0);

                    return this.getValue(Number.parseInt(character.mass));
                }

                let imageUrl = await ImageApiService.getCharacterImage(id);
                if (!(await ImageApiService.isImageUrlValid(imageUrl))) {
                    imageUrl = '/sw-card-game/assets/images/placeholder.png';
                }
                
                return {
                    id: id,
                    image: imageUrl,
                    value: Math.round(value()),
                    name: character.name,
                    title: character.birth_year,
                    specie: specie,
                    homeworld: homeworld
                };
            })
        );
        return cards;
    }

    async fetchCard(id) {
        const character = await SwapiService.getCharacter(id); 
        if (!character) return {};

        let imageUrl = await ImageApiService.getCharacterImage(id);
        if (!(await ImageApiService.isImageUrlValid(imageUrl))) {
            imageUrl = '/sw-card-game/assets/images/placeholder.png';
        }

        const homeworld = await SwapiService.getHomeworld(id);
        const specie = (!character.species[0]) ? 'Human' : await SwapiService.getSpecies(id);
        const value = () => {
            if (character.mass === 'unknown')
                return this.getValue(0);

            return this.getValue(Number.parseInt(character.mass));
        }

        return {
            id: id,
            image: imageUrl,
            value: Math.round(value()),
            name: character.name,
            title: character.birth_year,
            specie: specie,
            homeworld: homeworld
        };
    }

    async fetchRandomCards(count) {
        const cards = await this.fetchAllCards();

        // Fisher-Yates Shuffling Algorithm
        for (let i = cards.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        return cards.slice(0, count);
    }

    getIdFromUrl(url) {
        return url.split('/')[5];
    }

    getValue(mass) {
        const MAX_VALUE = 999;
        const MIN_VALUE = 1;
        const MAX_MASS = 1500;
        const MIN_MASS = 0;

        const deltaMass = MAX_MASS - MIN_MASS;
        const deltaValue = MAX_VALUE - MIN_VALUE;
        const massDiff = mass - MIN_MASS;

        return MIN_VALUE + ((massDiff * deltaValue) / deltaMass);
    }
}

module.exports = new CardModel();