var KEYS = require('../utils/types').Keys;

function pressKey(device, req, res) {

    var key = req.params.key;
    if (key != undefined) {
        key = key.toUpperCase();
    }
    key = KEYS[key];
    if (key === undefined) {
        res.json({message:'Key not supported'});
    } else {
        device.pressKey(key, function(json) {
           res.json(json);
        });
    }
}

module.exports = function (api) {
    api.registerDeviceRestService('/key/:key', pressKey);

    for (var key in KEYS) {
        console.log("    Registered Key:  " + key);
    }
};