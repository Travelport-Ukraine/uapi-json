var uApiRequest = require('../uapiRequest');
var requests = require('../requests');
var AirParser = require('./AirParser');
var AirValidator = require('./AirValidator');
var ErrorHandlers = require('./AirErrors');
var config = require('../config');

module.exports = function(auth, debug) {

    return {
        searchLowFares: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_LOW_FARE_SEARCH_REQUEST,
            AirValidator.AIR_LOW_FARE_SEARCH_REQUEST,
            AirParser.AIR_SEARCH_ERRORS,
            AirParser.AIR_LOW_FARE_SEARCH_REQUEST,
            debug
        ),

        Availability: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_AVAILABILITY_REQUEST, //TODO
            AirValidator.AIR_AVAILABILITY_REQ,
            null,
            AirParser.AIR_AVAILABILITY_REQ,
            debug
        ),

        AirPrice: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_PRICE_REQ,
            AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
            null,
            AirParser.AIR_PRICE_REQUEST
        ),

        AirPrice_PricingSolutionXML: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_PRICE_REQ,
            AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
            null,
            AirParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML
        ),

        AirPrice_Manual: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_PRICE_REQ,
            AirValidator.AIR_PRICE_MANUAL,
            null,
            AirParser.AIR_PRICE_REQUEST
        ),

        CreateReservation: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_CREATE_RESERVATION_REQUEST,
            AirValidator.AIR_CREATE_RESERVATION_REQUEST,
            null,
            AirParser.AIR_CREATE_RESERVATION_REQUEST,
            debug
        ),

        Ticket: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_TICKET_REQUEST,
            AirValidator.AIR_REQUEST_BY_PNR, //checks for PNR
            null,
            AirParser.AIR_TICKET_REQUEST
        ),

        ImportPNR: uApiRequest(
            config(auth.region).UniversalRecord.url,
            auth,
            requests.UniversalRecord.UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST,
            AirValidator.AIR_REQUEST_BY_PNR, //checks for PNR
            null,
            AirParser.AIR_IMPORT_REQUEST
        ),

        FareRules_Booked: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_PRICING_FARE_RULES,
            AirValidator.FARE_RULES_BOOKED,
            null,
            AirParser.AIR_PRICE_FARE_RULES
        ),

        FareRules_Trips_TravellerRefs: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_PRICING_FARE_RULES,
            AirValidator.FARE_RULES_TRIPS_TRAVELER_REFS,
            null,
            AirParser.AIR_PRICE_FARE_RULES
        ),

        FareRules_Unbooked: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.AIR_PRICING_FARE_RULES,
            AirValidator.FARE_RULES_BOOKED,
            null,
            AirParser.AIR_PRICE_FARE_RULES
        ),

        FareRules_Unbooked_uAPI: uApiRequest(
            config(auth.region).AirService.url,
            auth,
            requests.AirService.FARE_RULES_REQUEST,
            AirValidator.FARE_RULES_UAPI,
            null,
            AirParser.FARE_RULES_RESPONSE
        ),

        GDSQueue: uApiRequest(
            config(auth.region).GdsQueueService.url,
            auth,
            requests.GdsQueueService.GDS_QUEUE_PLACE,
            AirValidator.GDS_QUEUE_PLACE,
            AirParser.AIR_SEARCH_ERRORS,
            AirParser.GDS_QUEUE_PLACE_RESPONSE,
            debug
        ),
    };
};
