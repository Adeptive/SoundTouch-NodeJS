var http = require('http');

function list(api, req, res) {
    var devices = api.getDevices();
    var deviceArray = [];
    for(var device in devices) {
        var d = devices[device];
        deviceArray.push({
            name: d.name,
            addresses: d.addresses
        });
    }

    res.json(deviceArray);
}

function listAdvanced(api, req, res) {
    var devices = api.getDevices();
    res.json(devices);
}

function setName(api, req, res) {
    var name = req.params.volume;
    var data = "<name>" + name + "</name>";

    api.setForDevice("name", data, api, req, res);
}


module.exports = function (api) {
    api.registerRestService('/device/list', list);
    api.registerRestService('/device/listAdvanced', listAdvanced);
    api.registerRestService('/:deviceName/name/:name', setName);
};