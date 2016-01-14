'use strict';

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mdns = require('mdns');
var requireFu = require('require-fu');
var express = require('express');
var request = require('request');

var discovery = require('./discovery');

var server = this;

var webroot = path.resolve(__dirname, 'static');

//Settings
var settings = {
    port: 5006,
    cacheDir: './cache',
    webroot: webroot,
    packagesDir: __dirname + '/package'
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

        json = handler(discovery, req, res);

        if (json === false) {
            res.status(500).json({ message: 'error' });
        } else if (json === true)  {
            res.json({ message: 'success' });
        }
    });
};

this.registerDeviceRestService = function (action, handler) {
    action = '/:deviceName' + action;
    console.log("Registered:  " + action);
    services.push(action);
    app.get(action, function (req, res) {
        var json = "";

        var deviceName = req.params.deviceName;
        var device = discovery.getDevice(deviceName);

        if (device == undefined) {
            res.json({message:'No Device found with name ' + deviceName});
            return;
        }

        //TODO: check if handler is known

        json = handler(device, req, res);

        if (json === false) {
            res.status(500).json({ message: 'error' });
        } else if (json === true)  {
            res.json({ message: 'success' });
        }
    });
};

this.registerServerRestService = function (action, handler) {
    console.log("Registered:  " + action);
    services.push(action);
    app.get(action, function (req, res) {
        var json = "";

        //TODO: check if handler is known

        json = handler(server, req, res);

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


discovery.search();