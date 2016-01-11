var http = require('http');

function getVolume(device, req, res) {
    device.getVolume(function(json) {
        res.json(json);
    });
}

function setVolume(device, req, res) {
    var volume = req.params.volume;
    device.setVolume(volume, function(json) {
        res.json(json);
    });
}

module.exports = function (api) {
    api.registerDeviceRestService('/volume', getVolume);
    api.registerDeviceRestService('/volume/:volume', setVolume);
};