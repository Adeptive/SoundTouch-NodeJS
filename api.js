var http = require('http');
var parser = require('./utils/xmltojson');
var request = require('request');

var KEYS = require('./utils/types').Keys;
var SOURCES = require('./utils/types').Source;

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

SoundTouchAPI.prototype.isAlive = function(handler) {
    this.getNowPlaying(function(json){
        if (json == undefined) {
            handler(false);
            return;
        }
        var isAlive =  json.nowPlaying.source != SOURCES.STANDBY;
        handler(isAlive);
    });
};


SoundTouchAPI.prototype.getVolume = function(handler) {
    this._getForDevice("volume", handler);
};

SoundTouchAPI.prototype.setVolume = function(volume, handler) {
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
    this.pressKey(KEYS.PLAY, handler);
};

SoundTouchAPI.prototype.stop = function(handler) {
    this.pressKey(KEYS.STOP, handler);
};

SoundTouchAPI.prototype.pause = function(handler) {
    this.pressKey(KEYS.PAUSE, handler);
};

SoundTouchAPI.prototype.playPause = function(handler) {
    this.pressKey(KEYS.PLAY_PAUSE, handler);
};

SoundTouchAPI.prototype.power = function(handler) {
    this.pressKey(KEYS.POWER, handler);
};

SoundTouchAPI.prototype.powerOn = function(handler) {
    this.isAlive(function(isAlive) {
        if (!isAlive) {
            this.pressKey(KEYS.POWER, function(json) {
                handler(true);
            });
        } else {
            handler(false);
        }
    });
};

SoundTouchAPI.prototype.powerOnWithVolume = function(volume, handler) {
    this.isAlive(function(isAlive) {
        if (!isAlive) {
            this.pressKey(KEYS.POWER, function(json) {
                this.setVolume(volume, function(json) {
                    handler(true);
                });
            });
        } else {
            handler(false);
        }
    });
};

SoundTouchAPI.prototype.powerOff = function(handler) {
    this.isAlive(function(isAlive) {
        if (isAlive) {
            this.pressKey(KEYS.POWER, function(json) {
                handler(true);
            });
        } else {
            handler(false);
        }
    });
};

SoundTouchAPI.prototype.pressKey = function(key, handler) {
    var press = "<key state=\"press\" sender=\"Gabbo\">" + key + "</key>";
    var release = "<key state=\"release\" sender=\"Gabbo\">" + key + "</key>";

    var api = this;

    api._setForDevice("key", press, function(json) {
        api._setForDevice("key", release, handler);
    });
};

SoundTouchAPI.prototype.getZone = function(handler) {
    this._getForDevice("getZone", handler);
};

SoundTouchAPI.prototype.setZone = function(members, handler) {
    this._zones('setZone', members, handler);
};

SoundTouchAPI.prototype.addZoneSlave = function(members, handler) {
    this._zones('addZoneSlave', members, handler);
};

SoundTouchAPI.prototype.removeZoneSlave = function(members, handler) {
    this._zones('removeZoneSlave', members, handler);
};

SoundTouchAPI.prototype._zones = function(action, members, handler) {
    var item = {};

    item.master = master;
    var data = '<zone master="' + this.getDevice().txtRecord.MAC + '" senderIPAddress="127.0.0.1">';

    for (var i in members) {
        var member = members[i];
        if (i == 0) {
            item.slaves = [];
            item.slaves.push(member);
            data += '<member>' + member + '</member>';
        } else  {
            item.slaves.push(member);
            data += '<member>' + member + '</member>';
        }
    }
    data += '</zone>';

    this._setForDevice(action, data, function(json) {
        handler(json, item);
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