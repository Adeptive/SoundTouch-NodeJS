var soundTouchDiscovery = require('./discovery');

soundTouchDiscovery.search(function(deviceAPI) {

    console.log(deviceAPI.name);

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

    //soundTouchDiscovery.stopSearching();
});

/*
var url = 'http://192.168.1.28:8080';

var io = require('socket.io-client');

var socket = io(url, {
    //port: 8080,
    id: 'gabbo',
    path: '/',
    autoConnect: true
});

socket.on('connect', function(){
    console.log('Connected');
});
socket.on('event', function(data){
    console.log('Received: ' + data);
});
socket.on('disconnect', function(){
    console.log('Connection closed');
});

/*socket.connect(function(v) {
    console.log(v);
});*/