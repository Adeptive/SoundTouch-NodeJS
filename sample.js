var soundTouchDiscovery = require('./discovery');

soundTouchDiscovery.search(function(deviceAPI) {

    console.log(deviceAPI.name + " --> " + deviceAPI.getDevice().ip);

    deviceAPI.isAlive(function(json) {
        console.log(deviceAPI.name + ' --> isAlive: ' + json);
    });

    deviceAPI.isPoweredOn(function(json) {
        console.log(deviceAPI.name + ' --> isPoweredOn: ' + json);
    });

    deviceAPI.getVolume(function(json) {
        console.log(deviceAPI.name + ' --> Volume: ', json.volume.actualvolume);
    });

    deviceAPI.getNowPlaying(function(json) {
        console.log(deviceAPI.name + ' --> Now playing: ', json.nowPlaying.ContentItem);
    });


    //SOCKETS

    deviceAPI.socketStart();

    deviceAPI.setPoweredListener(function(poweredOn, nowPlaying) {
        console.log(poweredOn ? 'Powered On' : 'Powered Off');
    });

    deviceAPI.setIsPlayingListener(function(poweredOn) {
        console.log(poweredOn ? 'Playing' : 'Not playing');
    });

    deviceAPI.setVolumeUpdatedListener(function(json) {
        console.log("VOLUME UPDATED", json);
    });

    deviceAPI.setNowPlayingUpdatedListener(function(json) {
        console.log("NOW PLAYING UPDATED", json);
    });

    deviceAPI.setNowSelectionUpdatedListener(function(json) {
        console.log("NOW SELECTION UPDATED", json);
    });

    soundTouchDiscovery.stopSearching();
});