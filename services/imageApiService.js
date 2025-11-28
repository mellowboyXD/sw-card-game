const axios = require('axios');

class ImageApiService {
    static cache = new Map();
    static CACHE_TTL = 1000 * 60 * 30;

    constructor() {
        this.getCharacterImage = this.getCharacterImage.bind(this);
    }

    async getCharacterImage(id) {
        const key = `character_${id}`;
        const cachedResponse = ImageApiService.cache.get(key);
        if (cachedResponse && cachedResponse.expires > Date.now()) {
            return cachedResponse.data;
        }

        try {
            const apiResponse = await axios.get(`https://akabab.github.io/starwars-api/api/id/${id}.json`);
            ImageApiService.cache.set(key, {
                data: apiResponse.data.image,
                expires: Date.now() + ImageApiService.CACHE_TTL
            });
            return apiResponse.data.image;
        } catch (err) {
            console.error('Could not get image', err); 
        }
    }

    async isImageUrlValid(url) {
        try {
            const res = await axios.head(url);
            return res.status === 200;
        } catch (err) {
            return false;
        }
    }
}

module.exports = new ImageApiService();