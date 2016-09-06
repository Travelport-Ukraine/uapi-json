var assert = require('assert');
var parserErrorXML = require('./FakeResponses/error.js');

var uAPI = require('../index');
var uAPI_Parser = require('../src/uapi-parser');
var parser = new uAPI_Parser('v_36_0', {});

describe('parser tests', function () {
    it('parse with errors', function () {
        return parser.parseXML('adsdasds').then(function(res){} ,function(err){
            assert(err.errno === 11, 'Not correct error ');
        });
    });
});
