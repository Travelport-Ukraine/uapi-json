const uApiRequest = require('../../uapi-request');
const requests = require('../../requests');
const AirParser = require('./AirParser');
const AirValidator = require('./AirValidator');
// const ErrorHandlers = require('./AirErrors');
const config = require('../../config');

module.exports = function (auth, debug, production) {
  return {
    searchLowFares: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_LOW_FARE_SEARCH_REQUEST,
            'air:LowFareSearchRsp',
            AirValidator.AIR_LOW_FARE_SEARCH_REQUEST,
            AirParser.AIR_ERRORS,
            AirParser.AIR_LOW_FARE_SEARCH_REQUEST,
            debug
        ),

    availability: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_AVAILABILITY_REQUEST, // TODO
            null, // TODO
            AirValidator.AIR_AVAILABILITY_REQ,
            null,
            AirParser.AIR_AVAILABILITY_REQ,
            debug
        ),

    airPrice: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_PRICE_REQ,
            'air:airPriceRsp',
            AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
            null,
            AirParser.AIR_PRICE_REQUEST,
            debug
        ),

    airPricePricingSolutionXML: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_PRICE_REQ,
            null, // intentionally, no parsing; we need raw XML
            AirValidator.AIR_PRICE,
            AirParser.AIR_ERRORS,
            AirParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML,
            debug
        ),

    airPriceManual: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_PRICE_REQ,
            'air:airPriceRsp',
            AirValidator.AIR_PRICE_MANUAL,
            null,
            AirParser.AIR_PRICE_REQUEST
        ),

    createReservation: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_CREATE_RESERVATION_REQUEST,
            'universal:AirCreateReservationRsp',
            AirValidator.AIR_CREATE_RESERVATION_REQUEST,
            AirParser.AIR_ERRORS,
            AirParser.AIR_CREATE_RESERVATION_REQUEST,
            debug
        ),

    ticket: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_TICKET_REQUEST,
            'air:AirTicketingRsp',
            AirValidator.AIR_REQUEST_BY_PNR, // checks for PNR
            AirParser.AIR_ERRORS,
            AirParser.AIR_TICKET_REQUEST,
            debug
        ),

    importPNR: uApiRequest(
            config(auth.region, production).UniversalRecord.url,
            auth,
            requests.UniversalRecord.UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST,
            'universal:UniversalRecordImportRsp',
            AirValidator.AIR_REQUEST_BY_PNR, // checks for PNR
            AirParser.AIR_ERRORS,
            AirParser.AIR_IMPORT_REQUEST,
            debug
        ),

    fareRulesBooked: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_PRICING_FARE_RULES,
            'air:airPriceRsp',
            AirValidator.FARE_RULES_BOOKED,
            null,
            AirParser.AIR_PRICE_FARE_RULES
        ),

    fareRulesTripsTravellerRefs: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_PRICING_FARE_RULES,
            'air:airPriceRsp',
            AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
            null,
            AirParser.AIR_PRICE_FARE_RULES
        ),

    fareRulesUnbooked: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.AIR_PRICING_FARE_RULES,
            'air:airPriceRsp',
            AirValidator.FARE_RULES_BOOKED,
            null,
            AirParser.AIR_PRICE_FARE_RULES
        ),

    fareRulesUnbooked_uAPI: uApiRequest(
            config(auth.region, production).AirService.url,
            auth,
            requests.AirService.FARE_RULES_REQUEST,
            'air:AirFareRulesRsp',
            AirValidator.FARE_RULES_UAPI,
            null,
            AirParser.FARE_RULES_RESPONSE
        ),

    gdsQueue: uApiRequest(
            config(auth.region, production).GdsQueueService.url,
            auth,
            requests.GdsQueueService.GDS_QUEUE_PLACE,
            'gdsQueue:GdsQueuePlaceRsp', // TODO rewrite into uAPI parser
            AirValidator.GDS_QUEUE_PLACE,
            AirParser.AIR_ERRORS,
            AirParser.GDS_QUEUE_PLACE_RESPONSE,
            debug
        ),

    foid: uApiRequest(
      config(auth.region, production).UniversalRecord.url,
      auth,
      requests.UniversalRecord.UNIVERSAL_RECORD_FOID,
      'universal:UniversalRecordModifyRsp',
      AirValidator.UNIVERSAL_RECORD_FOID,
      AirParser.AIR_ERRORS,
      AirParser.UNIVERSAL_RECORD_FOID,
      debug
    ),

    cancelUR: uApiRequest(
            config(auth.region, production).UniversalRecord.url,
            auth,
            requests.AirService.AIR_CANCEL_UR,
            null, // TODO rewrite into uAPI parser
            AirValidator.AIR_CANCEL_UR,
            AirParser.AIR_ERRORS,
            AirParser.AIR_CANCEL_UR,
            debug
        ),
  };
};
