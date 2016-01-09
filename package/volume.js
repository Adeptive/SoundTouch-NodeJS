var http = require('http');

function getVolume(api, req, res) {
    api.getForDevice("volume", api, req, res);
}

function setVolume(api, req, res) {
    var volume = req.params.volume;
    var data = "<volume>" + volume + "</volume>";

    api.setForDevice("volume", data, api, req, res);
}

module.exports = function (api) {
    api.registerRestService('/:deviceName/volume', getVolume);
    api.registerRestService('/:deviceName/volume/:volume', setVolume);
};