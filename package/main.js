var KEYS = require('../utils/types').Keys;
var SOURCES = require('../utils/types').Source;

function main(server, req, res) {
    res.json({
        methods: server.getRegisteredServices()
    });
}

function getSources(discovery, req, res) {
    res.json({
        sources: SOURCES
    });
}

function getKeys(discovery, req, res) {
    res.json({
        keys: KEYS
    });
}

module.exports = function (api) {
    api.registerServerRestService('/', main);
    api.registerRestService('/api/sources-list', getSources);
    api.registerRestService('/api/keys-list', getKeys);
};