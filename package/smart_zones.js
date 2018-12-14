//TODO

var http = require('http');
var parser = require('../utils/xmltojson');
var SOURCE = require('../utils/types').Source;

var nowPlayingList = [];
var toProcessCount = 0;

function groupIntoVirtualZone(discovery, req, res) {
    nowPlayingList = [];

    var devices = discovery.getDevicesArray();

    toProcessCount = devices.length;
    for (var device in devices) {
        var d = devices[device];

        var deviceAPI = discovery.getDevice(d.name);

        deviceAPI.getNowPlaying(function (json) {
            _processNowPlaying(json, discovery, req, res);
        });
    }
}

function _processNowPlaying(nowPlaying, discovery, req, res) {
    nowPlayingList.push(nowPlaying);

    _processNowPlayingList(discovery, req, res, discovery);
}

function _processNowPlayingList(discovery, req, res) {
    if (nowPlayingList.length == toProcessCount) {
        var contentItemMap = {};

        for (var nowPlaying in nowPlayingList) {
            var playing = nowPlayingList[nowPlaying];

            var contentItem = playing.nowPlaying.ContentItem;
            var key = contentItem.source + "|" + contentItem.location + "|" + contentItem.sourceAccount;

            if (contentItemMap[key] == undefined) {
                contentItemMap[key] = {
                    devices: [],
                    isValidSource: _isValidSource(contentItem.source),
                    source: contentItem.source,
                    location: contentItem.location,
                    sourceAccount: contentItem.sourceAccount
                };
            }
            contentItemMap[key].devices.push(playing.nowPlaying.deviceID);
        }

        for (var i in contentItemMap) {
            var item = contentItemMap[i];

            if (item.isValidSource && item.devices.length > 1) {
                _createZone(item, discovery, req, res);
            } else if (!item.isValidSource) {
                item.skipped = true;
                item.message = "Not a valid source";
            } else if (item.devices.length <= 1) {
                item.skipped = true;
                item.message = "Only 1 device is playing this music source";
            }
        }

        res.json(contentItemMap);
    }
}

function _isValidSource(source) {
    return (source == SOURCE.PANDORA ||
        source == SOURCE.DEEZER ||
        source == SOURCE.IHEART ||
        source == SOURCE.SPOTIFY ||
        source == SOURCE.TUNEIN
    );
}

function _createZone(item, discovery, req, res) {

    console.log('Created virtual zone for ' + item.devices.length + " devices");

    discovery.createZone(item.devices, function (json, info) {
        console.log(info);
    });

    item.zoned = true;
}

module.exports = function (api) {
    api.registerRestService('/auto/virtualZone', groupIntoVirtualZone);
};