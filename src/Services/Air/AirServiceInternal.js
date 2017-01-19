const uApiRequest = require('../../Request/uapi-request');
const AirParser = require('./AirParser');
const AirValidator = require('./AirValidator');
const getConfig = require('../../config');

const templatesDir = `${__dirname}/templates`;

module.exports = function (auth, debug, production) {
  const config = getConfig(auth.region, production);
  return {
    searchLowFares: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_LOW_FARE_SEARCH_REQUEST.xml`,
      'air:LowFareSearchRsp',
      AirValidator.AIR_LOW_FARE_SEARCH_REQUEST,
      AirParser.AIR_ERRORS,
      AirParser.AIR_LOW_FARE_SEARCH_REQUEST,
      debug
    ),
    airPrice: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_PRICE_REQ.xml`,
      'air:airPriceRsp',
      AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
      null,
      AirParser.AIR_PRICE_REQUEST,
      debug
    ),
    airPricePricingSolutionXML: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_PRICE_REQ.xml`,
      null, // intentionally, no parsing; we need raw XML
      AirValidator.AIR_PRICE,
      AirParser.AIR_ERRORS,
      AirParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML,
      debug
    ),
    airPriceManual: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_PRICE_REQ_MANUAL.xml`,
      'air:airPriceRsp',
      AirValidator.AIR_PRICE_MANUAL,
      null,
      AirParser.AIR_PRICE_REQUEST
    ),
    createReservation: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_CREATE_RESERVATION_REQUEST.xml`,
      'universal:AirCreateReservationRsp',
      AirValidator.AIR_CREATE_RESERVATION_REQUEST,
      AirParser.AIR_ERRORS,
      AirParser.AIR_CREATE_RESERVATION_REQUEST,
      debug
    ),
    ticket: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_TICKET_REQUEST.xml`,
      'air:AirTicketingRsp',
      AirValidator.AIR_TICKET, // checks for PNR
      AirParser.AIR_ERRORS,
      AirParser.AIR_TICKET_REQUEST,
      debug
    ),
    importPNR: uApiRequest(
      config.UniversalRecord.url,
      auth,
      `${templatesDir}/UNIVERSAL_RECORD_IMPORT_REQUEST.xml`,
      'universal:UniversalRecordImportRsp',
      AirValidator.AIR_REQUEST_BY_PNR, // checks for PNR
      AirParser.AIR_ERRORS,
      AirParser.AIR_IMPORT_REQUEST,
      debug
    ),
    fareRulesBooked: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_PRICING_FARE_RULES.xml`,
      'air:airPriceRsp',
      AirValidator.FARE_RULES_BOOKED,
      null,
      AirParser.AIR_PRICE_FARE_RULES
    ),
    fareRulesTripsTravellerRefs: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_PRICING_FARE_RULES.xml`,
      'air:airPriceRsp',
      AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
      null,
      AirParser.AIR_PRICE_FARE_RULES
    ),
    fareRulesUnbooked: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_PRICING_FARE_RULES.xml`,
      'air:airPriceRsp',
      AirValidator.FARE_RULES_BOOKED,
      null,
      AirParser.AIR_PRICE_FARE_RULES
    ),
    fareRulesUnbooked_uAPI: uApiRequest(
      config.AirService.url,
      auth,
      `${templatesDir}/AIR_FARE_RULES_REQUEST.xml`,
      'air:AirFareRulesRsp',
      AirValidator.FARE_RULES_UAPI,
      null,
      AirParser.FARE_RULES_RESPONSE
    ),
    gdsQueue: uApiRequest(
      config.GdsQueueService.url,
      auth,
      `${templatesDir}/GDS_QUEUE_PLACE.xml`,
      'gdsQueue:GdsQueuePlaceRsp', // TODO rewrite into uAPI parser
      AirValidator.GDS_QUEUE_PLACE,
      AirParser.AIR_ERRORS,
      AirParser.GDS_QUEUE_PLACE_RESPONSE,
      debug
    ),
    foid: uApiRequest(
      config.UniversalRecord.url,
      auth,
      `${templatesDir}/UNIVERSAL_RECORD_FOID.xml`,
      'universal:UniversalRecordModifyRsp',
      AirValidator.UNIVERSAL_RECORD_FOID,
      AirParser.AIR_ERRORS,
      AirParser.UNIVERSAL_RECORD_FOID,
      debug
    ),
    cancelUR: uApiRequest(
      config.UniversalRecord.url,
      auth,
      `${templatesDir}/UNIVERSAL_RECORD_CANCEL_UR.xml`,
      null, // TODO rewrite into uAPI parser
      AirValidator.AIR_CANCEL_UR,
      AirParser.AIR_ERRORS,
      AirParser.AIR_CANCEL_UR,
      debug
    ),
    flightInfo: uApiRequest(
      config.FlightService.url,
      auth,
      `${templatesDir}/AIR_FLIGHT_INFORMATION_REQUEST.xml`,
      'air:FlightInformationRsp',
      AirValidator.AIR_FLIGHT_INFORMATION,
      AirParser.AIR_ERRORS,
      AirParser.AIR_FLIGHT_INFORMATION,
      debug
    ),
  };
};
