var uError = require('../errors');
var _ = require('lodash');
var async = require('async');


var format = require('./AirFormat');



var searchLowFaresValidate = function(obj){

    var root_arrays = ['AirPricePoint', 'AirSegment', 'FareInfo', 'FlightDetails', 'Route']; // +List, e.g. AirPricePointList, see below

    root_arrays.forEach(function(name) {
        var air_name = 'air:'+name+'List';
        if (!_.isObject(obj[air_name]))
            throw new uError('PARSING_AIR_WRONG_TYPE', obj[air_name]);
    });

    return obj;
};

var lowFaresSearchRequest = function(obj) {
    return format.formatLowFaresSearch({
        pcc: this.env.pcc,
        debug: false
    },
        searchLowFaresValidate.bind(this, obj)()
    );
};

var ticketParse = function(obj) {
    if (!obj['air:AirTicketingRsp'])
        throw new uError('PARSING_AIR_TICKET_NO_REPLY', obj);

    //FIXME STUB
    return obj;
};

var ticketRequest = function(obj) {
    return ticketParse(obj);
};

var nullParsing = function(obj) {
    return obj;
};

var getPassengers = function(list, BookingTraveler) {
    var self=this;
    var passengers =[];

    async.forEachOf(list, function(key) {
        var traveler = BookingTraveler[key];

        if (!traveler)
            throw new Error("Not all BookingTravelers present in list or wrong lookup keys provided");

        var name = traveler['common_'+self.uapi_version+':BookingTravelerName'];

        //SSR DOC parsing of passport data http://gitlab.travel-swift.com/galileo/galileocommand/blob/master/lib/command/booking.js#L84
        //TODO safety checks
        var ssr = traveler['common_'+self.uapi_version+':SSR'].first()['FreeText'].split('/'); //TODO try to parse Swift XI from common_v36_0:AccountingRemark first

        var passenger = {
            'lastName': name['Last'],
            'firstName': name['First'],
            'passCountry': ssr[1], //also in ssr[3]
            'passNumber': ssr[2],
            'birthDate': ssr[4], //ssr[6] is pass expiry date
            //'ageType': ssr[6], //FIXME available in PricingInfo['PassengerTypeCode']
            'gender': ssr[5]
        };


        passengers.push(passenger); //TODO error handling
    });

    return passengers;
};

var importRequest = function(data) {

    var record = data['universal:UniversalRecord'];
    var reservation = record['air:AirReservation'][0]; //TODO check what if there are several reservations?

    var response = {
        'trips': [],
        'passengers': [],
        'uapi_traveler_refs': reservation['common_'+this.uapi_version+':BookingTravelerRef'],
        'original': data
    };

    /*async.forEachOf(reservation['air:AirSegment'], function(segment, index) {
       response.trips.push(format.formatTrip(segment, {})); //TODO error handling
    //TODO split by legs!
    });*/

    response['trips'] = groupSegmentsByLegs(reservation['air:AirSegment']); //TODO add flatten for AirPriceReq/FareRules

    response.passengers = getPassengers.call(this, response['uapi_traveler_refs'], record['common_'+this.uapi_version+':BookingTraveler']);

    return response;
};

var extractFareRulesLong = function(obj) {
    var result = obj['air:FareRule'];
    _.forEach(result, function(item) {
        item.renameProperty('air:FareRuleLong', 'Rules');
    });

    return result;
};

var AirPriceFareRules = function(obj) {

    return _.extend(
        extractFareRulesLong(data['air:AirPriceResult'],
        {
            'ProviderCode': '1G' //NOTE provider is given for native uAPI request by FareRuleKey, but not here, add it
                                // FIXME fixed provider code
        })
    );
};

var FareRules = function(obj) {
    return extractFareRulesLong(obj);
};

var parsePenalty = function(obj, name) {

    if (!_.isObject(obj))
        throw new DataProcessingException();

    var value;
    if (value = obj['air:Percentage'])
        return {
            type: "percent",
            amount: parseFloat(value)
        };
    else if (value = obj['air:Amount'])
        return {
            type: "absolute",
            amount: value
        };
    else
        throw new Error("Unknown "+name+" types "+JSON.stringify(Object.keys(obj))); //TODO
};

/*
 * The flagship function for parsing reservations in
 * AirPriceReq (multiple passengers per air:AirPriceResult/air:AirPricingSolution/air:AirPricingInfo, no air:BookingInfo inside)
 * AirCreateReservationReq/UniversalRecordImportReq - air:AirReservation/air:AirPricingInfo (one passenger per air:AirPricingInfo, booking exists)
 *
 * NOTES:
 * - air:PassengerType in fare should be an array of passenger type codes (transform it if necessary)
 */
var parseReservation = function(fare, pricing) {
    var reservation = {
        priceInfo: {
            TotalPrice: pricing['TotalPrice'],
            BasePrice: pricing['BasePrice'],
            Taxes: pricing['Taxes'],
            passengersCount: countHistogram(fare['air:PassengerType']),
            TaxesInfo: _.map(fare['air:TaxInfo'], function(item) { return {value: item['Amount'], type: item['Category']}})
        },

        fare_str: fare['air:FareCalc'],
        //fares: [], TODO
        //uapi_fare_rule_keys: //TODO add dropLeafs option type to parser, use air:FareRuleKey as array of strings

        //TODO add baggage
    };

    //only in booked reservations
    if (fare['LatestTicketingTime'])
        reservation['timeToReprice'] = fare['LatestTicketingTime'];
    //TODO check if pricing['PricingMethod'] == Guaranteed

    return reservation;
};


/*
 * take air:AirSegment list and return Directions
 */
//TODO integrate into format.getTripsFromBooking
var groupSegmentsByLegs = function(segments) {
    var legs = _.toArray(_.groupBy(segments, 'Group'));

    legs.forEach(function(segments, index) {
        var trips = _.map(segments, function (segment) {
            var trip = format.formatTrip(segment, {});
            return trip;
        });

        legs[index] = trips;
    });

    return legs;
};

var get_reservations = function(prices) {

};

var AirPriceRsp = function(obj) {

    //TODO check root object

    var data = this.mergeLeafRecursive(obj, 'air:AirPriceRsp')['air:AirPriceRsp'];

    var itinerary = data['air:AirItinerary']; //TODO checks
    var segments  = itinerary['air:AirSegment']; //TODO checks

    var legs = groupSegmentsByLegs(segments);

    var price_result = data['air:AirPriceResult'];
    var prices = price_result['air:AirPricingSolution'];
    var price_keys = Object.keys(prices);
    if (price_keys.length > 1)
        throw new Error("Expected only one pricing solution, need to clarify search?"); //FIXME
    if (price_keys.length == 0)
        throw new Error("Not found");

    //TODO move to separate function e.g. get_reservation_options
    var pricing_options = _.map(prices, function(pricing) {
        var reservations = _.map(pricing['air:AirPricingInfo'], function(fare){
            var reservation = parseReservation(fare, pricing);
            reservation['status'] = 'Pricing';
            return reservation;
        });


        return reservations;
    });




    return {
        reservations: pricing_options[0],
        Directions: legs
    };
};

/*
 * returns keys of reservations (AirPricingInfos) with their corresponding passenger
 * category types and counts for an AirPricingSolution
 *
 * NOTE: uses non-parsed input
 */
var AirPriceRsp_passengers_per_reservation = function(obj) {

    var data = this.mergeLeafRecursive(obj, 'air:AirPriceRsp')['air:AirPriceRsp'];

    var price_result = data['air:AirPriceResult'];
    var prices = price_result['air:AirPricingSolution'];
    var price_keys = Object.keys(prices);

    var pricing = prices[_.first(price_keys)];

    return _.mapValues(pricing['air:AirPricingInfo'], function(fare) {
        return countHistogram(fare['air:PassengerType']);
    });

};

var AirPriceRsp_PricingSolutionXML = function(obj) {

    //first let's parse a regular structure
    var obj_copy = _.cloneDeep(obj);
    var passengersPerReservations = AirPriceRsp_passengers_per_reservation.call(this, obj_copy);

    var segments = obj['air:AirPriceRsp'][0]['air:AirItinerary'][0]['air:AirSegment'];

    var pricingSolution = obj['air:AirPriceRsp'][0]['air:AirPriceResult'][0]['air:AirPricingSolution'][0];

    //remove segment references and add real segments (required)
    delete(pricingSolution['air:AirSegmentRef']);

    pricingSolution['air:AirSegment'] = segments;

    //pricingSolution = moveObjectElement('air:AirSegment', '$', pricingSolution);

    var pricingInfos = pricingSolution['air:AirPricingInfo'];

    //delete existing air passenger types for each fare (map stored in passengersPerReservations)
    pricingInfos.forEach(function(info) {
       info['air:PassengerType'] = [];
    });

    this.env.passengers.forEach(function(passenger, index) {

        //find a reservation with places available for this passenger type, decrease counter
        var reservation_key = _.findKey(passengersPerReservations, function(item) {
            var ageCategory = passenger['ageCategory'];
            if (item[ageCategory] > 0) {
                item[ageCategory]--;
                return true;
            } else return false;
        });

        var pricingInfo = _.find(pricingInfos, function(info) {
           return info.$.Key == reservation_key;
        });

        pricingInfo['air:PassengerType'].push({
            "$": {
                BookingTravelerRef: "P_"+index,
                Code: passenger.ageCategory
            }
        });
    });

    var xml2js = require('xml2js');

    var result_xml = {};

    ['air:AirSegment', 'air:AirPricingInfo', 'air:FareNote'].forEach(function(root) {
        var builder = new xml2js.Builder({
            headless: true,
            rootName: root
        });

        //workaround because xml2js does not accept arrays to generate multiple "root objects"
        var build_object = {
            [root]: pricingSolution[root]
        };

        var int_result = builder.buildObject(build_object);
        //remove root object tags at first and last line
        var lines = int_result.split('\n');
        lines.splice(0, 1);
        lines.splice(-1, 1);

        //return
        result_xml[root+'_XML'] = lines.join('\n');
    });

    return {
        'air:AirPricingSolution': _.clone(pricingSolution['$']),
        'air:AirPricingSolution_XML': result_xml
    };
};

var AirErrorHandler = function(obj) {

    var err_data;
    if (obj['detail'] && (err_data = obj['detail']['common_v33_0:ErrorInfo'])) //FIXME collapse versions using a regexp search in uAPI_Parser
        switch (err_data['common_v33_0:Code']) {
            case "3037": //No availability on chosen flights, unable to fare quote
                throw new uError('EMPTY_RESULTS', obj); //TODO replace with custom error

            default:
                throw new uError('UNHANDLED_ERROR', obj); //TODO replace with custom error
        }
    else
        throw new uError('PARSING_ERROR', obj);
};

var countHistogram = function (arr) {
    var a = {}, prev;

    if (!_.isArray(arr))
        throw new Error('argument should be an array');

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a[arr[i]] = 1;
        } else {
            a[arr[i]]++;
        }
        prev = arr[i];
    }

    return a;
};

var extractBookings = function(obj) {
    var self=this;
    var record = obj['universal:UniversalRecord'];

    if (!record['air:AirReservation'] || record['air:AirReservation'].length == 0)
        throw new uError('PARSING_NO_BOOKINGS_ERROR');

    var bookings = [];
    //var uapi_locators = _.pluck(record['air:AirReservation'], 'LocatorCode');

    var travellers = record['common_'+this.uapi_version+':BookingTraveler'];
    var reservations = record['universal:ProviderReservationInfo'];

    record['air:AirReservation'].forEach(function(booking) {

        var provider_info = reservations[booking['common_'+self.uapi_version+':ProviderReservationInfoRef']];

        if (!provider_info)
            throw new Error("Can't find provider information about reservation");

        //we usually have one plating carrier across all per-passenger reservations
        var platingCarriers = _.pluck(booking['air:AirPricingInfo'], 'PlatingCarrier');
        var SinglePlatingCarrier = _.uniq(platingCarriers);
        if (SinglePlatingCarrier.length == 1) //FIXME: use a smart collapse algorithm?
            platingCarriers = SinglePlatingCarrier[0];

        var new_booking = {
            type: 'uAPI',
            pnr: provider_info['LocatorCode'],
            //pcc: this.env.pcc, //TODO remove search PCC from format?
            uapi_pnr_locator: booking['LocatorCode'],
            pnrList: [provider_info['LocatorCode']],
            platingCarrier: platingCarriers,
            createdAt: provider_info['CreateDate'],
            modifiedAt: provider_info['ModifiedDate'],
            reservations: [],
            trips: [],
            passengers: getPassengers.bind(self, booking['common_'+self.uapi_version+':BookingTravelerRef'], travellers)(),
            bookingPCC: provider_info['OwningPCC']
        };

        //var passegnerType = pricing['air:PassengerType']['Code'];

        _.forEach(booking['air:AirPricingInfo'], function(pricing, key) {

            /*var reservation = {
                timeToReprice: pricing['LatestTicketingTime'],
                priceInfo: {
                    TotalPrice: pricing['TotalPrice'],
                    BasePrice: pricing['BasePrice'],
                    Taxes: pricing['Taxes'],
                    passengersCount: countHistogram(_.pluck(pricing['air:PassengerType'], 'Code'))
                }
            };*/

            var passenger_refs = _.pluck(pricing['air:PassengerType'], 'BookingTravelerRef');

            //generate a "fare" object for parseReservation (no separation here in air:AirReservation/air:AirPricingInfo)
            //overwrite air:PassengerType so it matches one expected by parseReservation
            var fare = _.clone(pricing);
            fare['air:PassengerType'] = _.pluck(pricing['air:PassengerType'], 'Code');

            var reservation = parseReservation(fare, pricing);
            reservation['uapi_passenger_refs'] = passenger_refs;

            reservation['status'] = 'Reserved';


            new_booking['reservations'].push(reservation);
            Array.prototype.push.apply(new_booking['trips'],
                format.getTripsFromBooking(pricing, pricing['air:FareInfo'], booking['air:AirSegment']));

        });

        bookings.push(new_booking);
    });

    return bookings;
};

var gdsQueue = function (req) {

    //TODO implement all major error cases
    // https://support.travelport.com/webhelp/uapi/uAPI.htm#Error_Codes/QUESVC_Service_Error_Codes.htm%3FTocPath%3DError%2520Codes%2520and%2520Messages|_____9
    // like 7015 "Branch does not have Queueing configured"

    var data;
    if (data = req['common_v36_0:ResponseMessage'][0]) { //TODO check if there can be several messages
        var message = data['_'];
        if (message.match(/^Booking successfully placed/) === null) {
            throw new Error(message); //TODO replace with custom error
        }
    } else {
        throw new uError('GDS_PLACE_QUEUE_ERROR', req); //TODO replace with custom error
    }

    return true;
};

module.exports = {
    AIR_LOW_FARE_SEARCH_REQUEST : lowFaresSearchRequest,
    AIR_AVAILABILITY_REQUEST: nullParsing, //TODO
    AIR_PRICE_REQUEST: AirPriceRsp,
    AIR_PRICE_REQUEST_PRICING_SOLUTION_XML: AirPriceRsp_PricingSolutionXML,
    AIR_CREATE_RESERVATION_REQUEST: extractBookings,
    AIR_TICKET_REQUEST: ticketRequest,
    AIR_IMPORT_REQUEST: importRequest,
    AIR_PRICE_FARE_RULES: AirPriceFareRules,
    FARE_RULES_RESPONSE: FareRules,
    GDS_QUEUE_PLACE_RESPONSE: gdsQueue,

    //errors handling
    AIR_ERRORS: AirErrorHandler
};
