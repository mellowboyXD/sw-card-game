const axios = require('axios');

class SwapiService {
    static cache = new Map();
    static CACHE_TTL = 1000 * 60 * 30;

    async getAllCharacters() {
        const key = 'characters_all';
        const cachedResponse = SwapiService.cache.get(key);

        if (cachedResponse && cachedResponse.expires > Date.now()) {
            return cachedResponse.data;
        }

        try {
            let apiResponse = await axios.get('https://swapi.dev/api/people/');
            const characterData = apiResponse.data.results;
            while(apiResponse.data.next) {
                apiResponse = await axios.get(apiResponse.data.next);
                characterData.push(...apiResponse.data.results);
            }
            SwapiService.cache.set(key, {
                data: characterData,
                expires: Date.now() + SwapiService.CACHE_TTL
            });
            
            return characterData;
        } catch (err) {
            console.error('API Request Error', err);
        }
    }

    async getCharacter(id) {
        const key = `characters_${id}`;
        const cachedResponse = SwapiService.cache.get(key);

        if (cachedResponse && cachedResponse.expires > Date.now()) {
            return cachedResponse.data;
        }

        try {
            const apiResponse = await axios.get(`https://swapi.dev/api/people/${id}`);
            SwapiService.cache.set(key, {
                data: apiResponse.data,
                expires: Date.now() + SwapiService.CACHE_TTL
            });

            return apiResponse.data;
        } catch(err) {
            if (err.status == 404 || err.code == 'ETIMEOUT')
                return null;
            console.error('Api request error', err);
        }
    }

    async getSpecies(id) {
        const key = `species_${id}`;
        const cachedResponse = SwapiService.cache.get(key);

        if (cachedResponse && cachedResponse.expires > Date.now()) {
            return cachedResponse.data;
        }

        try {
            const apiResponse = await axios.get(`https://swapi.dev/api/species/${id}`);
            SwapiService.cache.set(key, {
                data: apiResponse.data.name,
                expires: Date.now() + SwapiService.CACHE_TTL
            });

            return apiResponse.data.name;
        } catch (err) {
            if (err.status == 404 || err.code == 'ETIMEOUT')
                return 'Unknown';
            console.error('API request error', err);
        }
    }

    async getHomeworld(id) {
        const key = `planets_${id}`;
        const cachedResponse = SwapiService.cache.get(key);

        if (cachedResponse && cachedResponse.expires > Date.now()) {
            return cachedResponse.data;
        }

        try {
            const apiResponse = await axios.get(`https://swapi.dev/api/planets/${id}`);
            SwapiService.cache.get(key, {
                data: apiResponse.data.name,
                expires: Date.now() + SwapiService.CACHE_TTL
            });

            return apiResponse.data.name;
        } catch (err) {
            if (err.status == 404 || err.code == 'ETIMEOUT')
                return 'Unknown';
            console.error('Api request error', err);
        }
    }
}

module.exports = new SwapiService();