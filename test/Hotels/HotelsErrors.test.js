var assert = require('assert');
var HotelsErrors = require('../../lib/Hotels/HotelsErrors');
describe('#HotelsErrors', function () {
    describe('checking function for error handling', function () {
        it('give empty results error', function () {
            var fakeError = require('../FakeResponses/error');
            try {
                var results = HotelsErrors(fakeError);

            } catch(e) {
                assert(e, 'no empty results');
                assert(e.errno === 13, 'no empty results');
            }
        });
    })
});