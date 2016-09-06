var proxy  = require('proxyquire'),
    sinon  = require('sinon'),
    assert = require('assert'),
    moment = require('moment');

describe('general tests', function () {
    it('should check all files for requests existing', function () {
        var requests = require('../src/requests');
        var fs = require('fs');
        for (var service in requests) {
            for (var request in requests[service]){
                assert.equal(true, fs.existsSync(requests[service][request]), request);
            }
        }
    });
});
