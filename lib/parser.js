var Promise = require('promise');
var uError = require('./errors');
var parseString = require('xml2js').parseString;
    parseString = Promise.denodeify(parseString);

var Parser = function(){};

Parser.prototype.parseXML = function(xml){
    return parseString(xml.body).then(function(res){
        if (res['SOAP:Envelope']) {
            return responseJSON = res['SOAP:Envelope']['SOAP:Body'][0];
        } else {
            throw new uError('PARSING_ERROR', err);
        }
    }, function(err) {
        throw new uError('PARSING_ERROR', err);
    });
};
module.exports =  new Parser();