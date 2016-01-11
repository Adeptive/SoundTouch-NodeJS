function list(discovery, req, res) {
    var devices = discovery.getDevices();
    var deviceArray = [];
    for(var device in devices) {
        var d = devices[device].getDevice();
        deviceArray.push({
            name: d.name,
            addresses: d.addresses
        });
    }

    res.json(deviceArray);
}

function listAdvanced(discovery, req, res) {
    var devices = discovery.getDevicesArray();
    res.json(devices);
}

function setName(device, req, res) {
    var name = req.params.name;
    device.setName(name, function(json) {
        res.json(json);
    });
}


module.exports = function (api) {
    api.registerRestService('/device/list', list);
    api.registerRestService('/device/listAdvanced', listAdvanced);
    api.registerDeviceRestService('/name/:name', setName);
};