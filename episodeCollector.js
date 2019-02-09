var soundTouchDiscovery = require('./discovery');
var fs = require('fs');
var path = require('path');
var util = require('util');
var store = require('data-store')('libraryContent', {
    cwd: 'dataStore'
});

// Store your setting better in collectorSettings.json
// start from collectorSettingsExample.json by copying
var settings = {
    deviceToListen: 'Office'
};


// load user settings
try {
    var userSettings = require(path.resolve(__dirname, 'collectorSettings.json'));
} catch (e) {
    console.log('No collectorSetting.json file found, will only use default settings');
}

if (userSettings) {
    for (var i in userSettings) {
        settings[i] = userSettings[i];
    }
}
console.log("Listening to device: " + settings.deviceToListen);
console.log(store.get());

soundTouchDiscovery.search(function(deviceAPI) {
    deviceAPI.socketStart();
    deviceAPI.setNowPlayingUpdatedListener(function(json) {
        if (deviceAPI.name === settings.deviceToListen) {
            if (json.nowPlaying.ContentItem != undefined) {
              console.log('We received ', json.nowPlaying.ContentItem);
                // we do not want to store duplicate items
                if (!store.has(json.nowPlaying.ContentItem.location)) {
                  var contentItem = json.nowPlaying.ContentItem ;
                  // NOTE: Would check for isPresetable, but there are cases where even
                  // it is not presetable (like AUX) isPresetable is set to true
                    console.log('Storing location for: ', contentItem.itemName);
                    store.set(contentItem.location, {
                        source: contentItem.source,
                        sourceAccount: contentItem.sourceAccount,
                        name: contentItem.itemName
                    });
                }
            }
        }

    });

    soundTouchDiscovery.stopSearching();
});
