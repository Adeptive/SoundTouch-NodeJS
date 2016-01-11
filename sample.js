var SoundTouchDiscovery = require('./discovery');

var s = new SoundTouchDiscovery();
s.search(function(deviceAPI) {
    deviceAPI.getNowPlaying(function(json) {
        console.log(json);
    });

    deviceAPI.getPresets(function(json) {
        console.log(json);
    });
});