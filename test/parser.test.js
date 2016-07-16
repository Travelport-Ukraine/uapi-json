var assert = require('assert');
var parserErrorXML = require('./FakeResponses/parser.xml.js');

var uAPI = require('../index');

describe('parser tests', function () {
    it('parse without errors', function () {
        var parser = require('../lib/parser');
        return parser.parseXML(parserErrorXML).then(function(res){
            assert(res['SOAP:Fault'] !== undefined, 'cant parse xml');
        });
    });

    it('parse with errors', function () {
        var parser = require('../lib/parser');
        return parser.parseXML('adsdasds').then(function(res){} ,function(err){
            assert(err.errno === 11, 'Not correct error ');
        });
    });
});