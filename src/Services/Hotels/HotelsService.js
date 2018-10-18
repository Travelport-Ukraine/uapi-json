const validateServiceSettings = require('../../utils/validate-service-settings');

const uApiRequest = require('../../Request/uapi-request');
const HotelsParser = require('./HotelsParser');
const HotelsValidator = require('./HotelsValidator');
const getConfig = require('../../config');
const templates = require('./templates');

module.exports = function (settings) {
  const {
    auth, debug, production, options
  } = validateServiceSettings(settings);
  const config = getConfig(auth.region, production);
  return {
    search: uApiRequest(
      config.HotelsService.url,
      auth,
      templates.search,
      'hotel:HotelSearchAvailabilityRsp',
      HotelsValidator.HOTELS_SEARCH_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_SEARCH_REQUEST,
      debug,
      options
    ),
    rates: uApiRequest(
      config.HotelsService.url,
      auth,
      templates.rate,
      'hotel:HotelDetailsRsp',
      HotelsValidator.HOTELS_RATE_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_RATE_REQUEST,
      debug,
      options
    ),
    book: uApiRequest(
      config.HotelsService.url,
      auth,
      templates.book,
      'universal:HotelCreateReservationRsp',
      HotelsValidator.HOTELS_BOOK_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_BOOK_REQUEST,
      debug,
      options
    ),
    cancelBook: uApiRequest(
      config.UniversalRecord.url,
      auth,
      templates.universalRecordCancelUR,
      'universal:UniversalRecordCancelRsp',
      HotelsValidator.HOTELS_CANCEL_BOOK_REQUEST,
      HotelsParser.HOTELS_ERROR,
      HotelsParser.HOTELS_CANCEL_BOOK_REQUEST,
      debug,
      options
    ),
  };
};
