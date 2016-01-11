

function getNowPlaying(device, req, res) {
    device.getNowPlaying(function(json) {
        res.json(json);
    });
}

function getTrackInfo(device, req, res) {
    device.getTrackInfo(function(json) {
        res.json(json);
    });
}

function getPresets(device, req, res) {
    device.getPresets(function(json) {
        res.json(json);
    });
}

function getSources(device, req, res) {
    device.getSources(function(json) {
        res.json(json);
    });
}

function getInfo(device, req, res) {
    device.getInfo(function(json) {
        res.json(json);
    });
}

function getDevice(device, req, res) {
    res.json(device);
}

module.exports = function (api) {
    api.registerDeviceRestService('/nowPlaying', getNowPlaying);
    api.registerDeviceRestService('/trackInfo', getTrackInfo);
    api.registerDeviceRestService('/presets', getPresets);
    api.registerDeviceRestService('/sources', getSources);
    api.registerDeviceRestService('', getDevice);
    api.registerDeviceRestService('/info', getInfo);
};