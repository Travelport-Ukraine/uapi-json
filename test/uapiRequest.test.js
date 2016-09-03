var assert = require('assert');
var proxy  = require('proxyquire');
var uAPI = require('./uapiRequest');
var config = require('./config');
var auth = require('./testconfig');
var requests = require('./requests');
var HotelsErrors = require('./Hotels/HotelsErrors');

describe('uapiRequest tests', function () {
    it('should return error request file not exists', function () {

        var missedFile = 'im the best missing filename';
        try{
            var someSerivce = uAPI(config.HotelsService.url, auth, missedFile);
        }catch(e){
            assert(e.errno == 8, 'Not resolved error number.');
        }
    });

    it('should give empty data error', function () {
        var someSerivce = uAPI(config.HotelsService.url, auth, requests.HotelsService.HOTELS_SEARCH_REQUEST);

        return someSerivce().then(function(msg){}, function(err){
            assert(err.errno == 5);
        });
    });

    it('should give undefined request error', function () {
        try{
            var someSerivce = uAPI(config.HotelsService.url, auth, requests.HotelsService.HOTELS_BLABALBAL);
        }catch(e){
            assert(e.errno == 7);
        }
    });

    it('should give auth data error', function () {
        try{
            var someSerivce = uAPI(config.HotelsService.url, {}, requests.HotelsService.HOTELS_BLABALBAL);
        }catch(e){
            assert(e.errno == 3);
        }
    });

    it('should give auth service url not provided error', function () {

        try{

            var someSerivce = uAPI('', auth, requests.HotelsService.HOTELS_BLABALBAL);
        }catch(e){
            assert(e.errno == 2);
        }
    });

    it('should check for timeout error', function () {
        this.timeout(10000);
        config.timeout = 1;
        var req = proxy('../lib/uapiRequest',
            {config: config});
        var service = req(
            config.HotelsService.url,
            auth,
            requests.HotelsService.HOTELS_SEARCH_REQUEST,
            function(params){return params} //stab for validation
        );
        return service({}).then(function(res){ console.log(res)}, function(err) {
            assert(err.errno === 10);
        });
    });
});
