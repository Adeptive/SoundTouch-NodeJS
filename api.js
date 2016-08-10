var http = require('http');
var parser = require('./utils/xmltojson');
var request = require('request');
var WebSocketClient = require('websocket').client;

var KEYS = require('./utils/types').Keys;
var SOURCES = require('./utils/types').Source;

/**
 *
 * Device should at least contain
 * {
 *  name: 'Kitchen',
 *  ip: '',
 *  mac_address: ''
 * }
 *
 * @param device
 * @constructor
 */
var SoundTouchAPI = function(device) {
    device.url = "http://" + device.ip + ":" + device.port;
    device.ws_url = "ws://" + device.ip + ":" + '8080';

    this.device = device;
    this.name = device.name;

    this.socket = {
        source: undefined
    };
};

SoundTouchAPI.prototype.getDevice = function() {
    return this.device;
};

SoundTouchAPI.prototype.getMetaData = function() {
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
        if (isAlive) {
            isAlive = json.nowPlaying.playStatus == 'PLAY_STATE';
        }
        handler(isAlive);
    });
};

SoundTouchAPI.prototype.isPoweredOn = function(handler) {
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


SoundTouchAPI.prototype.select = function(source, type, sourceAccount, location, handler) {
    if (source == undefined) {
        throw new Error("Source is not optional, provide a source from the SOURCES list.");
    }

    var data = '<ContentItem source="' + source + '" type="' + type + '" sourceAccount="' + sourceAccount + '" location="' + location + '">' +
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
    var api = this;
    api.isPoweredOn(function(isPoweredOn) {
        if (!isPoweredOn) {
            api.pressKey(KEYS.POWER, function(json) {
                handler(true);
            });
        } else {
            handler(false);
        }
    });
};

SoundTouchAPI.prototype.powerOnWithVolume = function(volume, handler) {
    var api = this;
    api.isPoweredOn(function(isPoweredOn) {
        if (!isPoweredOn) {
            api.pressKey(KEYS.POWER, function(json) {
                api.setVolume(volume, function(json) {
                    handler(true);
                });
            });
        } else {
            handler(false);
        }
    });
};

SoundTouchAPI.prototype.powerOff = function(handler) {
    var api = this;
    api.isPoweredOn(function(isPoweredOn) {
        if (isPoweredOn) {
            api.pressKey(KEYS.POWER, function(json) {
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
    
    // the below line looked like it might have been a copy/paste error from discovery.js? master is undefined here.
    // item.master = master;
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
 ****** WEB SOCKETS ***********
 */

SoundTouchAPI.prototype.socketStart = function(successCallback, errorCallback) {

    if (this.client != undefined) {
        return;
    }

    this.client = new WebSocketClient();

    var api = this;

    this.client.on('connect', function(connection) {
        if (successCallback != undefined) successCallback();

        connection.on('error', function(error) {
            if (errorCallback != undefined) errorCallback(error.toString());
        });
        connection.on('close', function() {
            api.client = undefined;
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var json = parser.convert(message.utf8Data);
                api.socketUpdate(json.updates);
            }
        });
    });

    this.client.on('connectFailed', function(error) {
        if (errorCallback != undefined) errorCallback(error.toString());
    });

    this.client.connect(this.getMetaData().ws_url, 'gabbo');
};

SoundTouchAPI.prototype.socketUpdate = function(json) {
    if (json.nowPlayingUpdated != undefined) {
        if (this.socket.nowPlayingUpdatedListener != undefined) {
            this.socket.nowPlayingUpdatedListener(json.nowPlayingUpdated);
        }

        //special listener: Powered On // Powered Off
        var source = json.nowPlayingUpdated.nowPlaying.source;

        if (this.socket.source != source) {
            this.socket.source = source;
            if (this.socket.poweredListener != undefined) {
                this.socket.poweredListener(source != SOURCES.STANDBY, json.nowPlayingUpdated.nowPlaying);
            }
        }

        //special listener: Playing // Not Playing
        var playStatus = json.nowPlayingUpdated.nowPlaying.playStatus;
        if (this.socket.playStatus != playStatus) {
            this.socket.playStatus = playStatus;
            if (this.socket.isPlayingListener != undefined) {
                this.socket.isPlayingListener(playStatus == 'PLAY_STATE', json.nowPlayingUpdated.nowPlaying);
            }
        }
    } else if (json.volumeUpdated != undefined) {
        this.socket.volume = json.volumeUpdated.volume.actualvolume;

        if (this.socket.volumeUpdatedListener != undefined) {
            this.socket.volumeUpdatedListener(json.volumeUpdated.volume.actualvolume, json.volumeUpdated);
        }
    } else if (json.connectionStateUpdated != undefined) {
        if (this.socket.connectionStateUpdatedListener != undefined) {
            this.socket.connectionStateUpdatedListener(json.connectionStateUpdated);
        }
    } else if (json.nowSelectionUpdated != undefined) {
        if (this.socket.nowSelectionUpdatedListener != undefined) {
            this.socket.nowSelectionUpdatedListener(json.nowSelectionUpdated);
        }
    } else if (json.recentsUpdated != undefined) {
        if (this.socket.recentsUpdatedListener != undefined) {
            this.socket.recentsUpdatedListener(json.recentsUpdated);
        }
    } else {
        console.log("Other update", json);
    }
};

SoundTouchAPI.prototype.setNowPlayingUpdatedListener = function(handler) {
    this.socket.nowPlayingUpdatedListener = handler;
};

SoundTouchAPI.prototype.setPoweredListener = function(handler) {
    this.socket.poweredListener = handler;
};

SoundTouchAPI.prototype.setIsPlayingListener = function(handler) {
    this.socket.isPlayingListener = handler;
};

SoundTouchAPI.prototype.setVolumeUpdatedListener = function(handler) {
    this.socket.volumeUpdatedListener = handler;
};

SoundTouchAPI.prototype.setConnectionStateUpdatedListener = function(handler) {
    this.socket.connectionStateUpdatedListener = handler;
};

SoundTouchAPI.prototype.setNowSelectionUpdatedListener = function(handler) {
    this.socket.nowSelectionUpdatedListener = handler;
};

SoundTouchAPI.prototype.setRecentsUpdatedListener = function(handler) {
    this.socket.recentsUpdatedListener = handler;
};

/*
****** UTILITY METHODS ***********
 */

SoundTouchAPI.prototype._getForDevice = function (action, callback) {
    var device = this.getMetaData();
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
