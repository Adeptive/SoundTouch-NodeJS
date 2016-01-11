var parser = require('xml2json');

module.exports = {

    convert: function (xml) {
        var options = {
            object: false,
            reversible: false,
            coerce: false,
            sanitize: true,
            trim: true,
            arrayNotation: false
        };
        return JSON.parse(parser.toJson(xml, options));
    },

    convertResponse: function(response, handler) {
        var output = "";

        response.on('data', function (chunk) {
            output += chunk;
        });

        response.on('end', function() {
            handler(JSON.parse(parser.toJson(output)))
        });
    }
};