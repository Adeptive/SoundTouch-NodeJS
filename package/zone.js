

function getZone(api, req, res) {
    api.getForDevice("getZone", api, req, res);
}

function setZone(api, req, res) {
    var deviceName = req.params.deviceName;
    var device = api.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    var slaveDeviceName = req.params.slaveDeviceName;
    var slaveDevice = api.getDevice(slaveDeviceName);
    if (slaveDevice == undefined) {
        res.json({message:'No Device found with name ' + slaveDevice});
        return;
    }

    if (device.ip == slaveDevice.ip) {
        res.json({message:'Master and Slave cannot be the same device.'});
        return;
    }

    var data = '<zone master="' + device.txtRecord.MAC + '" senderIPAddress="127.0.0.1">' +
        '<member ipaddress="' + slaveDevice.ip + '">' + slaveDevice.txtRecord.MAC + '</member>' +
        '</zone>';

    //TODO: support for multiple members

    api.setForDevice("setZone", data, api, req, res);
}

function _modifyZone(action, api, req, res) {
    var deviceName = req.params.deviceName;
    var device = api.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    var slaveDeviceName = req.params.slaveDeviceName;
    var slaveDevice = api.getDevice(slaveDeviceName);
    if (slaveDevice == undefined) {
        res.json({message:'No Device found with name ' + slaveDevice});
        return;
    }

    if (device.ip == slaveDevice.ip) {
        res.json({message:'Master and Slave cannot be the same device.'});
        return;
    }

    var data = '<zone master="' + device.txtRecord.MAC + '">' +
        '<member ipaddress="' + slaveDevice.ip + '">' + slaveDevice.txtRecord.MAC + '</member>' +
        '</zone>';

    api.setForDevice(action, data, api, req, res);
}

function addZoneSlave(api, req, res) {
    _modifyZone("addZoneSlave", api, req, res);
}

function removeZoneSlave(api, req, res) {
    _modifyZone("removeZoneSlave", api, req, res);
}

module.exports = function (api) {
    api.registerRestService('/:deviceName/getZone', getZone);
    api.registerRestService('/:deviceName/setZone/:slaveDeviceName', setZone);
    api.registerRestService('/:deviceName/addZoneSlave/:slaveDeviceName', addZoneSlave);
    api.registerRestService('/:deviceName/removeZoneSlave/:slaveDeviceName', removeZoneSlave);
};