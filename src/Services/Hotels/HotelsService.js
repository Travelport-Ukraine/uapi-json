const uApiRequest = require('../../uapi-request');
const HotelsParser = require('./HotelsParser');
const HotelsValidator = require('./HotelsValidator');
const HotelsErrors = require('./HotelsErrors');
const getConfig = require('../../config');

const templatesDir = `${__dirname}/templates`;

module.exports = function (settings) {
  const { auth, debug, production } = settings;
  const config = getConfig(auth.region, production);
  return {
    search: uApiRequest(
      config.HotelsService.url,
      auth,
      `${templatesDir}/HOTELS_SEARCH_REQUEST.xml`,
      null,
      HotelsValidator.HOTELS_SEARCH_REQUEST,
      HotelsErrors,
      HotelsParser.HOTELS_SEARCH_REQUEST,
      debug
    ),
    searchGalileo: uApiRequest(
      config.HotelsService.url,
      auth,
      `${templatesDir}/HOTELS_SEARCH_GALILEO_REQUEST.xml`,
      null,
      HotelsValidator.HOTELS_SEARCH_GALILEO_REQUEST,
      HotelsErrors,
      HotelsParser.HOTELS_SEARCH_GALILEO_REQUEST,
      debug
    ),
    rates: uApiRequest(
      config.HotelsService.url,
      auth,
      `${templatesDir}/HOTELS_RATE_REQUEST.xml`,
      null,
      HotelsValidator.HOTELS_RATE_REQUEST,
      HotelsErrors,
      HotelsParser.HOTELS_RATE_REQUEST,
      debug
    ),
    book: uApiRequest(
      config.HotelsService.url,
      auth,
      `${templatesDir}/HOTELS_BOOK_REQUEST.xml`,
      null,
      HotelsValidator.HOTELS_BOOK_REQUEST,
      HotelsErrors,
      HotelsParser.HOTELS_BOOK_REQUEST,
      debug
    ),
    cancelBook: uApiRequest(
      config.UniversalRecord.url,
      auth,
      `${templatesDir}/UNIVERSAL_RECORD_CANCEL_UR.xml`,
      null,
      HotelsValidator.HOTELS_CANCEL_BOOK_REQUEST,
      HotelsErrors,
      HotelsParser.HOTELS_CANCEL_BOOK_REQUEST,
      debug
    ),
  };
};