var http = require('http');
var parser = require('./utils/xmltojson');
var request = require('request');

var KEYS = require('./utils/types').Keys;


var SoundTouchAPI = function(device) {
    this.device = device;
    this.name = device.name;
};

SoundTouchAPI.prototype.getDevice = function() {
    return this.device;
};

SoundTouchAPI.prototype.getNowPlaying = function(handler) {
    this._getForDevice("now_playing", handler);
};

SoundTouchAPI.prototype.getTrackInfo = function(handler) {
    this._getForDevice("trackInfo", handler);
};

SoundTouchAPI.prototype.getPresets = function(handler) {
    this._getForDevice("presets", handler);
};

SoundTouchAPI.prototype.getSources = function(handler) {
    this._getForDevice("sources", handler);
};

SoundTouchAPI.prototype.getInfo = function(handler) {
    this._getForDevice("info", handler);
};



SoundTouchAPI.prototype.getVolume = function(handler) {
    this._getForDevice("volume", handler);
};

SoundTouchAPI.prototype.setVolume = function(name, handler) {
    var data = "<volume>" + volume + "</volume>";
    this._setForDevice("volume", data, handler);
};


SoundTouchAPI.prototype.select = function(source, sourceAccount, location, handler) {
    if (source == undefined) {
        throw new Error("Source is not optional, provide a source from the SOURCES list.");
    }

    var data = '<ContentItem source="' + source + '" sourceAccount="' + sourceAccount + '" location="' + location + '">' +
        '<itemName>' + 'Select using API' + '</itemName>' +
        '</ContentItem>';

    this._setForDevice("select", data, handler);
};

SoundTouchAPI.prototype.setName = function(name, handler) {
    var data = "<name>" + name + "</name>";
    this._setForDevice("name", data, handler);
};

SoundTouchAPI.prototype.play = function(handler) {
    this._pressKey(KEYS.PLAY, handler);
};

SoundTouchAPI.prototype.pressKey = function(key, handler) {
    var press = "<key state=\"press\" sender=\"Gabbo\">" + key + "</key>";
    var release = "<key state=\"release\" sender=\"Gabbo\">" + key + "</key>";

    console.log("Press Key: " + key);

    this._setForDevice("key", press, function(json) {
        this._setForDevice("key", release, handler);
    });
};

/*
****** UTILITY METHODS ***********
 */

SoundTouchAPI.prototype._getForDevice = function (action, callback) {
    var device = this.getDevice();
    http.get(device.url + "/" + action, function(response) {
            parser.convertResponse(response, function(json) {
                callback(json);
            });
        })
        .on('error', function(e) {
            console.error("Got error: " + e.message);
            throw new Error(e.message);
        });
};

SoundTouchAPI.prototype._setForDevice = function (action, data, handler) {
    var device = this.getDevice();

    var options =  {
        url: device.url + '/' + action,
        form: data
    };

    request.post(options, function(err, httpResponse, body) {
        var json = parser.convert(body);
        handler(json);
    });
};

module.exports = SoundTouchAPI;