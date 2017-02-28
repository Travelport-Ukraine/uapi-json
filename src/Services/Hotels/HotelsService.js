const uApiRequest = require('../../Request/uapi-request');
const HotelsParser = require('./HotelsParser');
const HotelsValidator = require('./HotelsValidator');
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
      'hotel:HotelSearchAvailabilityRsp',
      HotelsValidator.HOTELS_SEARCH_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_SEARCH_REQUEST,
      debug
    ),
    rates: uApiRequest(
      config.HotelsService.url,
      auth,
      `${templatesDir}/HOTELS_RATE_REQUEST.xml`,
      'hotel:HotelDetailsRsp',
      HotelsValidator.HOTELS_RATE_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_RATE_REQUEST,
      debug
    ),
    book: uApiRequest(
      config.HotelsService.url,
      auth,
      `${templatesDir}/HOTELS_BOOK_REQUEST.xml`,
      'universal:HotelCreateReservationRsp',
      HotelsValidator.HOTELS_BOOK_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_BOOK_REQUEST,
      debug
    ),
    cancelBook: uApiRequest(
      config.UniversalRecord.url,
      auth,
      `${templatesDir}/UNIVERSAL_RECORD_CANCEL_UR.xml`,
      'universal:UniversalRecordCancelRsp',
      HotelsValidator.HOTELS_CANCEL_BOOK_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_CANCEL_BOOK_REQUEST,
      debug
    ),
  };
};
