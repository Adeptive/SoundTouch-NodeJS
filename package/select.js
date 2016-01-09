var http = require('http');
var SOURCE = require('../utils/types').Source;


function select(api, req, res) {
    var sourceParam = req.params.source;
    var sourceAccount = req.params.sourceAccount;
    var location = req.params.location;
    var source = SOURCE[sourceParam];
    if (source == undefined) {
        res.json({message:'Source "' + sourceParam + '" is not supported'});
        return;
    }

    if (sourceAccount == undefined) {
        sourceAccount = '';
    }

    if (location == undefined) {
        location = '';
    }

    console.log("Selecting to play new music source");

    var data = '<ContentItem source="' + source + '" sourceAccount="' + sourceAccount + '" location="' + location + '">' +
        '<itemName>' + 'Select using API' + '</itemName>' +
        '</ContentItem>';

    api.setForDevice("select", data, api, req, res);
}

module.exports = function (api) {
    api.registerRestService('/:deviceName/select/:source/:sourceAccount/:location', select);
    api.registerRestService('/:deviceName/select/:source/:location', select);

    for (var source in SOURCE) {
        console.log("    Registered sources:  " + source);
    }

    console.log("    (Use '/:deviceName/sources' to get a list of all available sources for that device)");
};