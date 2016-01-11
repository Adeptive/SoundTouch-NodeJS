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
        if (d.txtRecord.MAC == macAddress) {
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

SoundTouchDiscovery.prototype.search = function(callback) {
    console.log("Started Searching...");
    var discovery = this;
    var sequence = [
        mdns.rst.DNSServiceResolve(),
        mdns.rst.getaddrinfo({families: [4] })
    ];

    // watch all http servers
    var browser = mdns.createBrowser(mdns.tcp('soundtouch'), {resolverSequence: sequence});
    browser.on('serviceUp', function(service) {
        console.log("service up: ", service.name);

        service.ip = service.addresses[0];
        service.url = "http://" + service.addresses[0] + ":" + service.port;

        var deviceAPI = new SoundTouchAPI(service);
        discovery.addDevice(deviceAPI);
        if (callback != undefined) {
            callback(deviceAPI);
        }
    });
    browser.on('serviceDown', function(service) {
        console.log("service down: ", service.name);
        discovery.deleteDevice(service);
    });
    browser.start();
};

module.exports = SoundTouchDiscovery;