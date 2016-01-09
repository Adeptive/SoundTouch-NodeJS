function getNowPlaying(api, req, res) {
    api.getForDevice("now_playing", api, req, res);
}

function getTrackInfo(api, req, res) {
    api.getForDevice("trackInfo", api, req, res);
}

function getPresets(api, req, res) {
    api.getForDevice("presets", api, req, res);
}

function getSources(api, req, res) {
    api.getForDevice("sources", api, req, res);
}

function getInfo(api, req, res) {
    api.getForDevice("info", api, req, res);
}

function getDevice(api, req, res) {
    var deviceName = req.params.deviceName;
    var device = api.getDevice(deviceName);
    res.json(device);
}

module.exports = function (api) {
    api.registerRestService('/:deviceName/nowPlaying', getNowPlaying);
    api.registerRestService('/:deviceName/trackInfo', getTrackInfo);
    api.registerRestService('/:deviceName/presets', getPresets);
    api.registerRestService('/:deviceName/sources', getSources);
    api.registerRestService('/:deviceName', getDevice);
    api.registerRestService('/:deviceName/info', getInfo);
};