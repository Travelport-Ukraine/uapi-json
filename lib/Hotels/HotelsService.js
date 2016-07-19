var uApiRequest = require('../uapiRequest');
var requests = require('../requests');
var HotelsParser = require('./HotelsParser');
var HotelsValidator = require('./HotelsValidator');
var HotelsErrors = require('./HotelsErrors');
var config = require('../config');

module.exports = function(auth, debug, production) {
    return {
        search: uApiRequest(
            config(auth.region, production).HotelsService.url,
            auth,
            requests.HotelsService.HOTELS_SEARCH_REQUEST,
            null,
            HotelsValidator.HOTELS_SEARCH_REQUEST,
            HotelsErrors,
            HotelsParser.HOTELS_SEARCH_REQUEST,
            debug
        ),
        searchGalileo: uApiRequest(
            config(auth.region, production).HotelsService.url,
            auth,
            requests.HotelsService.HOTELS_SEARCH_GALILEO_REQUEST,
            null,
            HotelsValidator.HOTELS_SEARCH_GALILEO_REQUEST,
            HotelsErrors,
            HotelsParser.HOTELS_SEARCH_GALILEO_REQUEST,
            debug
        ),
        rates: uApiRequest(
            config(auth.region, production).HotelsService.url,
            auth,
            requests.HotelsService.HOTELS_RATE_REQUEST,
            null,
            HotelsValidator.HOTELS_RATE_REQUEST,
            HotelsErrors,
            HotelsParser.HOTELS_RATE_REQUEST,
            debug
        ),
        book: uApiRequest(
            config(auth.region, production).HotelsService.url,
            auth,
            requests.HotelsService.HOTELS_BOOK_REQUEST,
            null,
            HotelsValidator.HOTELS_BOOK_REQUEST,
            HotelsErrors,
            HotelsParser.HOTELS_BOOK_REQUEST,
            debug
        ),
        cancelBook: uApiRequest(
            config(auth.region, production).UniversalRecord.url,
            auth,
            requests.HotelsService.HOTELS_CANCEL_BOOK_REQUEST,
            HotelsValidator.HOTELS_CANCEL_BOOK_REQUEST,
            HotelsErrors,
            HotelsParser.HOTELS_CANCEL_BOOK_REQUEST,
            debug
        ),
    };
};
