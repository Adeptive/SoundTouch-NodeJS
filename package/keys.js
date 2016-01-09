var http = require('http');
var parser = require('../xmltojson');
var KEYS = require('../utils/types').Keys;


function _pressKey(key, api, req, res) {
    var press = "<key state=\"press\" sender=\"Gabbo\">" + key + "</key>";
    var release = "<key state=\"release\" sender=\"Gabbo\">" + key + "</key>";

    console.log("Press Key: " + key);

    api.setForDevice("key", press , api, req, res, function(json) {
        api.setForDevice("key", release , api, req, res);
    });
}

module.exports = function (api) {
    api.registerRestService('/:deviceName/key/:key', function (api, req, res) {

        var key = req.params.key;
        if (key != undefined) {
            key = key.toUpperCase();
        }
        key = KEYS[key];
        if (key === undefined) {
            res.json({message:'Key not supported'});
        } else {
            _pressKey(key, api, req, res);
        }

    });

    for (var key in KEYS) {
        console.log("    Registered Key:  " + key);
    }
};