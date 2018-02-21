var http = require('http');
var parser = require('../utils/xmltojson');
var SOURCE = require('../utils/types').Source;
var store = require('data-store')('libraryContent', {
    cwd: 'dataStore'
});

const ALLIDS = store.get();
const ALLIDS_SIZE = _getStoreLength(ALLIDS);
var PRESET_KEY_NO_DEFAULT = 6;

var originalVolumen;

function _wait(msec) {
    var waitTill = new Date(new Date().getTime() + msec);
    while (waitTill > new Date()) {}
}

function _randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function _getStoreLength(store) {
    var i = 0;
    for (var j in store) {
        i++;
    }
    return i;
}

function _getElement(n, store) {
    var i = 0;
    for (var j in store) {
        i++;
        if (i === n) {
            return j
        }
    }
}


function _storeActualVolume(json) {
    originalVolumen = json.volume.actualvolume;
}

function reduceVolume(device, req, res) {
    device.getVolume(_storeActualVolume);
    device.setVolume(1, function(json) {})
}

// TODO: Document this
// localhost:5006/Kueche/auto/episodeSelector/?presetkey=5

function selectRandomEpisode(device, req, res, location) {
    var theEpisodeNo = _randomIntInc(1, ALLIDS_SIZE);
    var theEpisodeElement = _getElement(theEpisodeNo, ALLIDS)
    var theEpisodeContent = store.get(theEpisodeElement);
    var presetKey = req.params.presetKey;

    reduceVolume(device, req, res);

    if (presetKey) {
        if (presetKey >= 1 && presetKey <= 6) {
            PRESET_KEY_NO = presetKey;
        } else {
            // 416 	Requested range not satisfiable
            res.status(416).json({
                message: "presetKey should be between 1 and 6"
            });
            return;
        }
    } else {
        PRESET_KEY_NO = PRESET_KEY_NO_DEFAULT;
    }

    device.select(theEpisodeContent.source, undefined, theEpisodeContent.sourceAccount, theEpisodeElement,
        function(json) {
            _wait(1000); // wait a second after started playing
            device.stop(function() {});
            device.setPreset(PRESET_KEY_NO,
                function(json) {
                    device.stop(function() {
                        device.setVolume(originalVolumen, function() {});
                    });
                }
            )
        }
    );
    res.json({
        album: theEpisodeContent.name,
        entry: theEpisodeElement,
        source: theEpisodeContent.source,
        sourceAccount: theEpisodeContent.sourceAccount,
        presetKey: PRESET_KEY_NO
    });

}

function getAllEpisodes(discovery, req, res) {
    res.json(ALLIDS);
}

module.exports = function(api) {
    api.registerRestService('/auto/getAllEpisodes', getAllEpisodes)
    api.registerDeviceRestService('/auto/episodeSelector/:presetKey?', selectRandomEpisode);
};
