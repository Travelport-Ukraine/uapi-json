var proxy  = require('proxyquire');
var sinon  = require('sinon');
var assert = require('assert');

var Parser = require('../../lib/Air/AirParser');
var ticketingJson = require('../FakeResponses/Air/ticketing.rsp.json');

describe('#AirParser', function () {
    describe('AIR_TICKET_REQUEST()', function () {
        it('should test air ticket response parser.', function () {
            var parsedResponse = Parser.AIR_TICKET_REQUEST(ticketingJson);
            assert(parsedResponse === true, 'Incorrect parsing of ticketing response.');
        });
    });
});
