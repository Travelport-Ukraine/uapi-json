var assert = require('assert');
var proxy  = require('proxyquire');
var uAPI = require('../src/uapi-request');
var config = require('../src/config');
var auth = require('./testconfig');
var path = require('path');

var hotelsSearchReqeustPath = `${path.join(__dirname, '../src/Services/Hotels/templates/HOTELS_SEARCH_REQUEST.xml')}`;

var auth = {
  username: '123',
  password: '123'
};


describe('uapiRequest tests', function () {
    it('should return error request file not exists', function () {
        var missedFile = 'im the best missing filename';
        try {
          var someSerivce = uAPI(config().HotelsService.url, auth, missedFile);
        } catch(e) {
          assert(e.errno == 8, 'Not resolved error number.');
        }
    });

    it('should give empty data error', function () {
        var someSerivce = uAPI(config().HotelsService.url, auth, hotelsSearchReqeustPath, null, null, null, function() {});

        return someSerivce().then(function(msg){}, function(err){
            assert(err.errno == 5);
        });
    });

    it('should give undefined request error', function () {
        try{
            var someSerivce = uAPI(config().HotelsService.url, auth, undefined);
        }catch(e){
            assert(e.errno == 7);
        }
    });

    it('should give auth data error', function () {
        try{
            var someSerivce = uAPI(config().HotelsService.url, {}, undefined);
        }catch(e){
            assert(e.errno == 3);
        }
    });

    it('should give auth service url not provided error', function () {

        try{

            var someSerivce = uAPI('', auth, undefined);
        }catch(e){
            assert(e.errno == 2);
        }
    });
});
