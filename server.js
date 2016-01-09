'use strict';

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mdns = require('mdns');
var requireFu = require('require-fu');
var express = require('express');
var parser = require('./xmltojson');

var request = require('request');

var webroot = path.resolve(__dirname, 'static');

//Settings
var settings = {
    port: 5006,
    cacheDir: './cache',
    webroot: webroot,
    packagesDir: __dirname + '/package',
    discoveryProtocol: 'soundtouch'
};

// load user settings
try {
    var userSettings = require(path.resolve(__dirname, 'settings.json'));
} catch (e) {
    console.log('No settings file found, will only use default settings');
}

if (userSettings) {
    for (var i in userSettings) {
        settings[i] = userSettings[i];
    }
}

// Create webroot + tts if not exist
if (!fs.existsSync(webroot)) {
    fs.mkdirSync(webroot);
}
if (!fs.existsSync(webroot + '/tts/')) {
    fs.mkdirSync(webroot + '/tts/');
}

var app = express();
var api = this;

// this handles registering of all actions
var services = [];
this.registerRestService = function (action, handler) {
    console.log("Registered:  " + action);
    services.push(action);
    app.get(action, function (req, res) {
        var json = "";

        //TODO: check if handler is known

        json = handler(api, req, res);

        if (json === false) {
            res.status(500).json({ message: 'error' });
        } else if (json === true)  {
            res.json({ message: 'success' });
        }
    });
};

this.getRegisteredServices = function() {
    return services;
};

//load packages
requireFu(settings.packagesDir)(this);

//TODO
//app.use(express.static('public'));
//app.use(express.static('files'));
app.use(express.static('static'));

var httpServer = http.createServer(app);

httpServer.listen(settings.port, function () {
    var port = httpServer.address().port;
    console.log('HTTP REST server listening on port', port);
});


//API
var devices = {};
this.getDevices = function () {
    return devices;
};
this.getDevice = function (deviceName) {
    for(var device in devices) {
        var d = devices[device];
        if (d.name == deviceName) {
            return d;
        }
    }
    return undefined;
};

this.getDeviceForMacAddress = function (macAddress) {
    for(var device in devices) {
        var d = devices[device];
        if (d.txtRecord.MAC == macAddress) {
            return d;
        }
    }
    return undefined;
};

this.getDevicesArray = function () {
    var deviceArray = [];
    for(var device in devices) {
        var d = devices[device];
        deviceArray.push(d);
    }
    return deviceArray;
};

this.getForDevice = function (action, api, req, res, handler) {
    var deviceName = req.params.deviceName;
    var device = api.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    if (handler === undefined) {
        handler = function(response) {
            //console.log("Got response: " + response.statusCode);

            parser.convertResponse(response, function(json) {
                res.json(json);
            });

        };
    }

    http.get(device.url + "/" + action, handler)
        .on('error', function(e) {
        console.error("Got error: " + e.message);
        res.json({message:'error'});
    });
};

this.setForDevice = function (action, data, api, req, res, handler) {
    var deviceName = req.params.deviceName;
    var device = api.getDevice(deviceName);
    if (device == undefined) {
        res.json({message:'No Device found with name ' + deviceName});
        return;
    }

    if (handler === undefined) {
        handler = function(json) {
            res.json(json);
        };
    }

    var options =  {
        url: device.url + '/' + action,
        form: data
    };

    request.post(options, function(err, httpResponse, body) {
        var json = parser.convert(body);
        handler(json);
    });
};

var sequence = [
    mdns.rst.DNSServiceResolve()
    , mdns.rst.getaddrinfo({families: [4] })
];

// watch all http servers
var browser = mdns.createBrowser(mdns.tcp(settings.discoveryProtocol), {resolverSequence: sequence});
browser.on('serviceUp', function(service) {
    console.log("service up: ", service.name);

    service.ip = service.addresses[0];
    service.url = "http://" + service.addresses[0] + ":" + service.port;

    devices[service.name] = service;
});
browser.on('serviceDown', function(service) {
    console.log("service down: ", service.name);
    delete devices[service.name];
});
browser.start();