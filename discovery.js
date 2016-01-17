var mdns = require('mdns');
var SoundTouchAPI = require('./api');

var SoundTouchDiscovery = function() {
    this.devices = [];
};

SoundTouchDiscovery.prototype.addDevice = function(device) {
    this.devices[device.name] = device;
};

SoundTouchDiscovery.prototype.deleteDevice = function(device) {
    delete this.devices[device.name];
};

SoundTouchDiscovery.prototype.getDevices = function () {
    return this.devices;
};

SoundTouchDiscovery.prototype.getDevice = function (deviceName) {
    for(var device in this.devices) {
        var d = this.devices[device].getDevice();
        if (d.name == deviceName) {
            return this.devices[device];
        }
    }
    return undefined;
};

SoundTouchDiscovery.prototype.getDeviceForMacAddress = function (macAddress) {
    for(var device in this.devices) {
        var d = this.devices[device].getDevice();
        if (d.mac_address == macAddress) {
            return this.devices[device];
        }
    }
    return undefined;
};

SoundTouchDiscovery.prototype.getDevicesArray = function () {
    var deviceArray = [];
    for(var device in this.devices) {
        var d = this.devices[device].getDevice();
        deviceArray.push(d);
    }
    return deviceArray;
};

SoundTouchDiscovery.prototype.createZone = function(members, handler) {
    var data = '';
    var item = {};

    for (var i in members) {
        var member = members[i];
        if (i == 0) {
            item.master = member;
            data += '<zone master="' + member + '" senderIPAddress="127.0.0.1">';
        } else if (i == 1) {
            item.slaves = [];
            item.slaves.push(member);
            data += '<member>' + member + '</member>';
        } else  {
            item.slaves.push(member);
            data += '<member>' + member + '</member>';
        }
    }
    data += '</zone>';

    var device = this.getDeviceForMacAddress(item.master);

    device._setForDevice("setZone", data, function(json) {
        handler(json, item);
    });
};

SoundTouchDiscovery.prototype.search = function(callbackUp, callbackDown) {
    console.log("Started Searching...");
    var discovery = this;
    var sequence = [
        mdns.rst.DNSServiceResolve(),
        mdns.rst.getaddrinfo({families: [4] })
    ];

    // watch all http servers
    this.browser = mdns.createBrowser(mdns.tcp('soundtouch'), {resolverSequence: sequence});
    this.browser.on('serviceUp', function(service) {
        service.ip = service.addresses[0];
        service.mac_address = service.txtRecord.MAC;
        var deviceAPI = new SoundTouchAPI(service);
        discovery.addDevice(deviceAPI);
        if (callbackUp != undefined) {
            callbackUp(deviceAPI);
        }

    });
    this.browser.on('serviceDown', function(service) {
        discovery.deleteDevice(service);
        if (callbackDown != undefined) {
            callbackDown(service);
        }
    });
    this.browser.start();
};

SoundTouchDiscovery.prototype.stopSearching = function() {
    if (this.browser != undefined) {
        this.browser.stop();
    }
};

module.exports = new SoundTouchDiscovery();