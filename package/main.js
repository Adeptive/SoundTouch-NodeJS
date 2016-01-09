var KEYS = require('../utils/types').Keys;
var SOURCES = require('../utils/types').Source;

function main(api, req, res) {
    res.json({
        methods: api.getRegisteredServices()
    });
}

function getSources(api, req, res) {
    res.json({
        sources: SOURCES
    });
}

function getKeys(api, req, res) {
    res.json({
        keys: KEYS
    });
}

module.exports = function (api) {
    api.registerRestService('/', main);
    api.registerRestService('/api/sources-list', getSources);
    api.registerRestService('/api/keys-list', getKeys);
};