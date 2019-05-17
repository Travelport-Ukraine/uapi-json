const uApiRequest = require('../../Request/uapi-request');
const AirParser = require('./AirParser');
const AirValidator = require('./AirValidator');
const getConfig = require('../../config');
const templates = require('./templates');

module.exports = function (settings) {
  const {
    auth, debug, production, options
  } = settings;
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
      options
    ),
    availability: uApiRequest(
      config.AirService.url,
      auth,
      templates.availability,
      'air:AvailabilitySearchRsp',
      AirValidator.AIR_LOW_FARE_SEARCH_REQUEST,
      AirParser.AIR_ERRORS,
      AirParser.AIR_AVAILABILITY,
      debug,
      options
    ),
    lookupFareRules: uApiRequest(
      config.AirService.url,
      auth,
      templates.price,
      'air:AirPriceRsp',
      AirValidator.AIR_PRICE_FARE_RULES_REQUEST,
      AirParser.AIR_ERRORS,
      AirParser.AIR_PRICE_FARE_RULES_REQUEST,
      debug,
      options
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
      options
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
      options
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
      options
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
      options
    ),
    getUniversalRecord: uApiRequest(
      config.UniversalRecord.url,
      auth,
      templates.universalRecordRetrieve,
      'universal:UniversalRecordRetrieveRsp',
      AirValidator.UNIVERSAL_RECORD_RETRIEVE,
      AirParser.AIR_ERRORS,
      AirParser.UNIVERSAL_RECORD_RETRIEVE_REQUEST,
      debug,
      options
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
      options
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
      options
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
      options
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
      options
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
      options
    ),
    getTickets: uApiRequest(
      config.AirService.url,
      auth,
      templates.retrieveDocument,
      'air:AirRetrieveDocumentRsp',
      AirValidator.AIR_GET_TICKETS,
      AirParser.AIR_GET_TICKETS_ERROR_HANDLER,
      AirParser.AIR_GET_TICKETS,
      debug,
      options
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
      options
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
      options
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
      options
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
      options
    ),
  };
};
