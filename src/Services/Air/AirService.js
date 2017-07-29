const uApiRequest = require('../../Request/uapi-request');
const AirParser = require('./AirParser');
const AirValidator = require('./AirValidator');
const getConfig = require('../../config');
const templates = require('./templates');

module.exports = function (settings) {
  const { auth, debug, production, additionalOptions } = settings;
  const config = getConfig(auth.region, production);

  return {
    searchLowFares: uApiRequest(
      config.AirService.url,
      auth,
      templates.lowFareSearch,
      'air:LowFareSearchRsp',
      AirValidator.AIR_LOW_FARE_SEARCH_REQUEST,
      AirParser.AIR_ERRORS,
      AirParser.AIR_LOW_FARE_SEARCH_REQUEST,
      debug,
      additionalOptions
    ),
    airPricePricingSolutionXML: uApiRequest(
      config.AirService.url,
      auth,
      templates.price,
      null, // intentionally, no parsing; we need raw XML
      AirValidator.AIR_PRICE,
      AirParser.AIR_ERRORS,
      AirParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML,
      debug,
      additionalOptions
    ),
    createReservation: uApiRequest(
      config.AirService.url,
      auth,
      templates.createReservation,
      'universal:AirCreateReservationRsp',
      AirValidator.AIR_CREATE_RESERVATION_REQUEST,
      AirParser.AIR_ERRORS,
      AirParser.AIR_CREATE_RESERVATION_REQUEST,
      debug,
      additionalOptions
    ),
    ticket: uApiRequest(
      config.AirService.url,
      auth,
      templates.ticket,
      'air:AirTicketingRsp',
      AirValidator.AIR_TICKET, // checks for PNR
      AirParser.AIR_ERRORS,
      AirParser.AIR_TICKET_REQUEST,
      debug,
      additionalOptions
    ),
    getUniversalRecordByPNR: uApiRequest(
      config.UniversalRecord.url,
      auth,
      templates.universalRecordImport,
      'universal:UniversalRecordImportRsp',
      AirValidator.AIR_REQUEST_BY_PNR, // checks for PNR
      AirParser.AIR_ERRORS,
      AirParser.AIR_IMPORT_REQUEST,
      debug,
      additionalOptions
    ),
    gdsQueue: uApiRequest(
      config.GdsQueueService.url,
      auth,
      templates.gdsQueuePlace,
      'gdsQueue:GdsQueuePlaceRsp', // TODO rewrite into uAPI parser
      AirValidator.GDS_QUEUE_PLACE,
      AirParser.AIR_ERRORS,
      AirParser.GDS_QUEUE_PLACE_RESPONSE,
      debug,
      additionalOptions
    ),
    foid: uApiRequest(
      config.UniversalRecord.url,
      auth,
      templates.universalRecordFoid,
      'universal:UniversalRecordModifyRsp',
      AirValidator.UNIVERSAL_RECORD_FOID,
      AirParser.AIR_ERRORS,
      AirParser.UNIVERSAL_RECORD_FOID,
      debug,
      additionalOptions
    ),
    cancelUR: uApiRequest(
      config.UniversalRecord.url,
      auth,
      templates.universalRecordCancelUr,
      null, // TODO rewrite into uAPI parser
      AirValidator.AIR_CANCEL_UR,
      AirParser.AIR_ERRORS,
      AirParser.AIR_CANCEL_UR,
      debug,
      additionalOptions
    ),
    flightInfo: uApiRequest(
      config.FlightService.url,
      auth,
      templates.flightInformation,
      'air:FlightInformationRsp',
      AirValidator.AIR_FLIGHT_INFORMATION,
      AirParser.AIR_ERRORS,
      AirParser.AIR_FLIGHT_INFORMATION,
      debug,
      additionalOptions
    ),
    getTicket: uApiRequest(
      config.AirService.url,
      auth,
      templates.retrieveDocument,
      'air:AirRetrieveDocumentRsp',
      AirValidator.AIR_GET_TICKET,
      AirParser.AIR_ERRORS,
      AirParser.AIR_GET_TICKET,
      debug,
      additionalOptions
    ),
    cancelTicket: uApiRequest(
      config.AirService.url,
      auth,
      templates.voidDocument,
      'air:AirVoidDocumentRsp',
      AirValidator.AIR_CANCEL_TICKET,
      AirParser.AIR_ERRORS,
      AirParser.AIR_CANCEL_TICKET,
      debug,
      additionalOptions
    ),
    cancelPNR: uApiRequest(
      config.AirService.url,
      auth,
      templates.cancel,
      'universal:AirCancelRsp',
      AirValidator.AIR_CANCEL_PNR,
      AirParser.AIR_ERRORS,
      AirParser.AIR_CANCEL_PNR,
      debug,
      additionalOptions
    ),

    exchangeQuote: uApiRequest(
      config.AirService.url,
      auth,
      templates.exchangeQuote,
      null,
      AirValidator.AIR_EXCHANGE_QUOTE,
      AirParser.AIR_ERRORS,
      AirParser.AIR_EXCHANGE_QUOTE,
      debug,
      additionalOptions
    ),

    exchangeBooking: uApiRequest(
      config.AirService.url,
      auth,
      templates.exchange,
      'air:AirExchangeRsp',
      AirValidator.AIR_EXCHANGE,
      AirParser.AIR_ERRORS,
      AirParser.AIR_EXCHANGE,
      debug,
      additionalOptions
    ),
  };
};
