function getZone(device, req, res) {
    device.getZone(function(json) {
        res.json(json);
    });
}

function setZone(discovery, req, res) {
    var deviceName = req.params.deviceName;
    var device = discovery.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    var slaveDeviceName = req.params.slaveDeviceName;
    var slaveDevice = discovery.getDevice(slaveDeviceName);
    if (slaveDevice == undefined) {
        res.json({message:'No Device found with name ' + slaveDevice});
        return;
    }

    if (device.device.ip == slaveDevice.device.ip) {
        res.json({message:'Master and Slave cannot be the same device.'});
        return;
    }

    var members = [slaveDevice.device.txtRecord.MAC];

    //TODO: support for multiple members
    device.setZone(members, function(json, info) {
        res.json(info);
    });
}

function addZoneSlave(discovery, req, res) {
    var deviceName = req.params.deviceName;
    var device = discovery.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    var slaveDeviceName = req.params.slaveDeviceName;
    var slaveDevice = discovery.getDevice(slaveDeviceName);
    if (slaveDevice == undefined) {
        res.json({message:'No Device found with name ' + slaveDevice});
        return;
    }

    if (device.device.ip == slaveDevice.device.ip) {
        res.json({message:'Master and Slave cannot be the same device.'});
        return;
    }

    var members = [slaveDevice.device.txtRecord.MAC];

    //TODO: support for multiple members
    device.addZoneSlave(members, function(json, info) {
        res.json(info);
    });
}

function removeZoneSlave(discovery, req, res) {
    var deviceName = req.params.deviceName;
    var device = discovery.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    var slaveDeviceName = req.params.slaveDeviceName;
    var slaveDevice = discovery.getDevice(slaveDeviceName);
    if (slaveDevice == undefined) {
        res.json({message:'No Device found with name ' + slaveDevice});
        return;
    }

    if (device.device.ip == slaveDevice.device.ip) {
        res.json({message:'Master and Slave cannot be the same device.'});
        return;
    }

    var members = [slaveDevice.device.txtRecord.MAC];

    //TODO: support for multiple members
    device.removeZoneSlave(members, function(json, info) {
        res.json(info);
    });
}

module.exports = function (api) {
    api.registerDeviceRestService('/getZone', getZone);
    api.registerRestService('/:deviceName/setZone/:slaveDeviceName', setZone);
    api.registerRestService('/:deviceName/addZoneSlave/:slaveDeviceName', addZoneSlave);
    api.registerRestService('/:deviceName/removeZoneSlave/:slaveDeviceName', removeZoneSlave);
};
