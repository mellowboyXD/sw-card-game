const path = require('path');

class IndexController {
    getPage(_, res) {
        res.status(200).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
}

module.exports = new IndexController();