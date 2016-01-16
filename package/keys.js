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

function play(device, req, res) {
    device.powerOn(function() {
        device.play(function(json) {
            res.json(json);
        });
    });
}

function playPause(device, req, res) {
    device.powerOn(function() {
        device.playPause(function(json) {
            res.json(json);
        });
    });
}

function powerOn(device, req, res) {
    device.powerOn(function(isPoweredOn) {
        res.json({'status': isPoweredOn});
    });
}

function powerOff(device, req, res) {
    device.powerOff(function(isPoweredOff) {
        res.json({'status': isPoweredOff});
    });
}

module.exports = function (api) {
    api.registerDeviceRestService('/key/:key', pressKey);

    api.registerDeviceRestService('/playPause', playPause);
    api.registerDeviceRestService('/play', play);

    api.registerDeviceRestService('/powerOff', powerOff);
    api.registerDeviceRestService('/powerOn', powerOn);

    for (var key in KEYS) {
        console.log("    Registered Key:  " + key);
    }
};