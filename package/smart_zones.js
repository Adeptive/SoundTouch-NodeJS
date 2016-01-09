var http = require('http');
var parser = require('../xmltojson');
var SOURCE = require('../utils/types').Source;

var nowPlayingList = [];
var toProcessCount = 0;

function groupIntoVirtualZone(api, req, res) {
    nowPlayingList = [];

    var devices = api.getDevicesArray();

    toProcessCount = devices.length;
    for(var device in devices) {
        var d = devices[device];

        http.get(d.url + "/" + "now_playing", function(response) {
            var device = d;
            parser.convertResponse(response, function(json) {
                _processNowPlaying(json, api, req, res);
            });
        }).on('error', function(e) {
            console.error("Got error: " + e.message);
            //res.json({message:'error'});
        });
    }
}

function _processNowPlaying(nowPlaying, api, req, res) {
    nowPlayingList.push(nowPlaying);

    _processNowPlayingList(api, req, res);
}

function _processNowPlayingList(api, req, res) {
    if (nowPlayingList.length == toProcessCount) {
        var contentItemMap = {};

        for(var nowPlaying in nowPlayingList) {
            var playing = nowPlayingList[nowPlaying];

            var contentItem = playing.nowPlaying.ContentItem;
            var key = contentItem.source + "|" + contentItem.location + "|" + contentItem.sourceAccount;

            if (contentItemMap[key] == undefined) {
                contentItemMap[key] = {
                    devices:[],
                    isValidSource : _isValidSource(contentItem.source),
                    source: contentItem.source,
                    location: contentItem.location,
                    sourceAccount: contentItem.sourceAccount
                };
            }
            contentItemMap[key].devices.push(playing.nowPlaying.deviceID);
        }

        for(var i in contentItemMap) {
            var item = contentItemMap[i];

            if (item.isValidSource && item.devices.length > 1) {
                _createZone(item, api, req, res);
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
   return (source == SOURCE.INTERNET_RADIO
       || source == SOURCE.PANDORA
       || source == SOURCE.DEEZER
       || source == SOURCE.IHEART
       || source == SOURCE.SPOTIFY
   );
}

function _createZone(item, api, req, res) {
    var data = '';
    var macAddressList = item.devices;

    for (var i in macAddressList) {
        var macAddress = macAddressList[i];
        if (i == 0) {
            item.master = macAddress;
            data += '<zone master="' + macAddress + '" senderIPAddress="127.0.0.1">';
        } else if (i == 1) {
            item.slaves = [];
            item.slaves.push(macAddress);
            data += '<member>' + macAddress + '</member>';
        } else  {
            item.slaves.push(macAddress);
            data += '<member>' + macAddress + '</member>';
        }
    }
    data += '</zone>';

    console.log('Created virtual zone for ' + macAddressList.length + " devices");

    var masterDevice = api.getDeviceForMacAddress(item.master);
    req.params.deviceName = masterDevice.name;
    api.setForDevice("setZone", data, api, req, res, function(json) {
        //do nothing
    });
    item.zoned = true;
}

module.exports = function (api) {
    api.registerRestService('/auto/virtualZone', groupIntoVirtualZone);
};