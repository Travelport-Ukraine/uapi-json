const uApiRequest = require('../uapi-request');
const requests = require('../requests');
const HotelsParser = require('./HotelsParser');
const HotelsValidator = require('./HotelsValidator');
const HotelsErrors = require('./HotelsErrors');
const config = require('../config');

module.exports = function (settings) {
  const auth = settings.auth;
  const debug = settings.debug;
  const production = settings.production;
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
