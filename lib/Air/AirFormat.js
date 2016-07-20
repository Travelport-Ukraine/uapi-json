/**
 * Created by juice on 2/9/16.
 */

var async = require('async'),
    Moment = require('moment'),
    _ = require('lodash');

var formatLowFaresSearch = function(search_request, search_result) {

    var start = new Date();

    var pcc = search_request.pcc;

    var prices_list = search_result['air:AirPricePointList'],
        fare_infos = search_result['air:FareInfoList'],
        segments = search_result['air:AirSegmentList'],
        flight_details = search_result['air:FlightDetailsList'];

    var legs = _.first(_.toArray(search_result['air:RouteList']))['air:Leg'];

//TODO filter prices_list by CompleteItinerary=true & ETicketability = Yes, etc

    var fares = [];

    async.forEachOf(prices_list, function (price, fare_key) {

        //ASSERT TODO make assert code separate
        //check plating carrier is the same for each passenger
        var platingCarrier = false;
        async.map(price['air:AirPricingInfo'], function (item, callback) {
                var new_pltCrr = item['PlatingCarrier'];
                if (!platingCarrier) platingCarrier = new_pltCrr;
                if (!platingCarrier == new_pltCrr)
                    throw new Error("Assert: Plating carriers do not coincide across all passenger reservations, old: " + platingCarrier + ", new: " + new_pltCrr);

                callback(null, new_pltCrr);
            },
            function (err, result) {
                if (search_request.debug)
                    console.log("List of plating carriers for fare "+fare_key+": " + JSON.stringify(result));
            }
        );


        //convert per-passenger fares into a simple list

        //async.map(price['air:AirPricingInfo'], function (fare, callback) {

                //var this_fare = fare;

        var first_key = _.first(Object.keys(price['air:AirPricingInfo']));
        var this_fare = price['air:AirPricingInfo'][first_key]; //get trips from first reservation

                var directions = [];

                async.map(this_fare['air:FlightOptionsList'], function (dir, callback) {
                        var direction = dir;

                        async.map(direction['air:Option'],
                            function (option, callback) {
                                /*var booking = option['air:BookingInfo'];

                                var travelTime = Moment.duration(option['TravelTime']);

                                var trips = [],
                                    connection = booking['air:Connection'];

                                if (!_.isArray(booking))
                                    throw new Error("Parser error: air:BookingInfo should be an array");

                                //get trips(legs)
                                async.map(booking, function (list, callback) {

                                        var fare_info = fare_infos[list['FareInfoRef']],
                                            segment = segments[list['SegmentRef']];

                                        var classes_avail = {};
                                        if (segment['air:AirAvailInfo']['ProviderCode'] == '1G') {
                                            var regex = /([A-Z])([0-9]|[CLRS])/;
                                            var counts_string;
                                            async.forEachOf((counts_string = segment['air:AirAvailInfo']['air:BookingCodeInfo']['BookingCounts']).split('|'),
                                                function (item, index) {
                                                    var tuple = item.match(regex);
                                                    if (tuple && tuple[1] && tuple[2])
                                                        classes_avail[tuple[1]] = tuple[2];
                                                    else
                                                        console.log("ERR: error parsing Galileo seat availability, input: ", item, " index: ", index, " string: ",  counts_string)
                                                });
                                        }

                                        var trip = { //TODO merge with formatTrip below
                                            from: segment['Origin'],
                                            to: segment['Destination'],

                                            bookingClass: list['BookingCode'], //detailed letter, like K, etc.
                                            serviceClass: list['CabinClass'],

                                            departure: segment['DepartureTime'],
                                            arrival: segment['ArrivalTime'],
                                            //departureTerminal
                                            //arrivalTerminal
                                            //MarketingCarrier, OperatingCarrier
                                            airline: segment['Carrier'], //FIXME
                                            flightNumber: segment['FlightNumber'],
                                            plane: segment['Equipment'],

                                            duration: segment['FlightTime'],

                                            fareBasisCode: fare_info['FareBasis'],
                                            //MarriedToNextSegment
                                            uapi_SegmentRef: list['SegmentRef'],

                                            seatsAvailable: classes_avail[list['BookingCode']]
                                        };

                                        callback(null, trip);
                                    },
                                    function (err, result) {
                                        if (err) throw new Error("Error formatting trips!");
                                        trips = result;
                                    });*/

                                var trips = getTripsFromBooking(option, fare_infos, segments, flight_details);


                                callback(null,
                                    {
                                        from: direction['Origin'],
                                        to: direction['Destination'],
                                        //duration
                                        //TODO get overnight stops, etc from connection
                                        platingCarrier: this_fare['PlatingCarrier'],
                                        Segments: trips
                                    });
                            },
                            function (err, result) {
                                if (err) console.log(err);
                                bookings = _.toArray(result);
                            }
                        );

                        callback(null, bookings);

                    },
                    function (err, result) {
                        directions = result;
                    });

        var passengerCounts = {};
        var passengerCategories = _.mapKeys(price['air:AirPricingInfo'], function(passenger_fare, key) {
            var code;
            if (_.isString(code = passenger_fare['air:PassengerType'])) { // air:PassengerType in fullCollapseList_obj uAPI_Parser param
                passengerCounts[code] = 1;
            } else if (_.isArray(code) && code.constructor === Array) { // air:PassengerType in noCollapseList uAPI_Parser param
                var count = code.length;
                var list = _.uniq(_.map(code, function(item) {
                    if (_.isString(item))
                        return item;
                    else if (_.isObject(item) && item.Code) { // air:PassengerType in fullCollapseList_obj like above, but there is Age or other info, except Code
                        return item.Code;
                    } else
                        throw new Error("Code is not set for PassengerTypeCode item"); //TODO use custom error
                }));
                if (! (code = list[0]) || list.length != 1 ) //TODO throw error
                    console.log("Warning: different categories "+list.join()+" in single fare calculation "+key+ " in fare "+fare_key);
                passengerCounts[code] = count;
            } else
                throw new Error("PassengerTypeCode is supposed to be a string or array of PassengerTypeCode items"); //TODO

            return code;
        });

        if (_.size(passengerCategories) != _.size(price['air:AirPricingInfo']))
            console.log("Warning: duplicate categories in passengerCategories map for fare "+fare_key);

                var result =
                {
                    TotalPrice: price['TotalPrice'],
                    BasePrice: price['BasePrice'],
                    Taxes: price['Taxes'],
                    Directions: directions,
                    BookingComponents: [
                        {
                            PCC: pcc,
                            TotalPrice: price['TotalPrice'],
                            BasePrice: price['BasePrice'],
                            Taxes: price['Taxes'],
                            uapi_ref_key: fare_key //TODO
                        }
                    ],
                    passenger_fares:    _.mapValues(passengerCategories, function(item) {
                                            return _.pick(item, ['TotalPrice', 'BasePrice', 'Taxes']);
                                        }),
                    passenger_counts: passengerCounts
                };

            //    callback(null, result);

            //},
            //function (err, result) {
            //    Array.prototype.push.apply(fares, _.toArray(result));
            //});

        fares.push(result);

    });

    fares.sort(function(a, b) {
        var price_a = a.TotalPrice.substr(3);
        var price_b = b.TotalPrice.substr(3);
        return parseFloat(price_a) - parseFloat(price_b);
    });

    var end = new Date() - start;
    console.info("AirFormat execution time: %dms", end);

    return fares;
};

var formatTrip = function(segment, list, fare_info, flight_details) {

    var trip = {
        from: segment['Origin'],
        to: segment['Destination'],

        bookingClass: segment['ClassOfService']?  //detailed letter, like K, etc.
            segment['ClassOfService'] /* from reservation */
            : list['BookingCode'] /* from search */,

        departure: segment['DepartureTime'],
        arrival: segment['ArrivalTime'],
        //departureTerminal
        //arrivalTerminal
        //MarketingCarrier, OperatingCarrier
        airline: segment['Carrier'], //FIXME
        flightNumber: segment['FlightNumber']

        //MarriedToNextSegment
        //SegmentRef: segment['Key']
    };

    //serviceClass: Economy, Business, etc.
    //NOTE: unavailable at AirPriceRsp/AirItinerary because trips are the same for all passengers, but classes aren't
    if (segment['CabinClass'])
        trip['serviceClass'] = segment['CabinClass']; /* from reservation */
    else if (list['CabinClass'])
        trip['serviceClass'] = list['CabinClass']; /* from search */

    trip['plane'] = segment['Equipment']?
        segment['Equipment'] /* from search */
        : (segment['air:FlightDetails']?  _.firstInObj(segment['air:FlightDetails'])['Equipment']:null);
    /* or take from imported reservation FlightDetails below */

    trip['duration'] = segment['FlightTime'] ?
        segment['FlightTime'] /* from search */
        : (segment['air:FlightDetails']? _.firstInObj(segment['air:FlightDetails'])['FlightTime']:null);
    /* take from imported reservation FlightDetails below */

    //fare basis is not available in AirPriceRsp/AirItinerary/AirSegment
    if (list['FareBasisCode'])
        trip['fareBasisCode'] = fare_info['FareBasis'];

    if (list['classes_avail'])
        trip['seatsAvailable'] = list['classes_avail'][trip['bookingClass']];

    if (list['SegmentRef'])
        trip['uapi_SegmentRef'] = list['SegmentRef'];

    //fetch tech stops data by included list or by refs
    var details, stops;
    if (_.isObject(details = segment['air:FlightDetails']) && Object.keys(details).length > 1) {

        trip['plane'] = _.pluck(segment['air:FlightDetails'], 'Equipment');

        trip['duration'] = _.pluck(segment['air:FlightDetails'], 'FlightTime');

        stops = Object.keys(details).map(function (key) {
            return details[key]['Origin'];
        });
    }
    else if (flight_details && (details = segment['air:FlightDetailsRef']) && details.length > 1)
        stops = details.map(function(ref) {
            return flight_details[ref]['Origin']; //TODO checks!
        });

    if (stops) {
        stops.shift(); //drop first place of take off
        console.log('yaay, we have tech stops at ' + JSON.stringify(stops));
        trip.techStops = stops;
    }

    //for booked segments
    if (segment['Status'])
        trip['status'] = segment['Status'];

    return trip;
};

_.firstInObj = function(obj) {
    for (f in obj) break;

    return obj[f];
};

var getTripsFromBooking = function(option, fare_infos, segments, flight_details) {
    var booking = option['air:BookingInfo'];

    var travelTime = Moment.duration(option['TravelTime']);

    var trips = [];
    //connection = booking['air:Connection'];

    if (!_.isArray(booking))
        throw new Error("Parser error: air:BookingInfo should be an array");

    //get trips(per leg)
    async.map(booking, function (list, callback) {

            var fare_info = fare_infos[list['FareInfoRef']],
                segment = segments[list['SegmentRef']];

            //per-class seat availability exists only at search
            var classes_avail = {};
            if (segment['air:AirAvailInfo'] && segment['air:AirAvailInfo']['ProviderCode'] == '1G') {
                var regex = /([A-Z])([0-9]|[CLRS])/;
                var counts_string;
                async.forEachOf((counts_string = segment['air:AirAvailInfo']['air:BookingCodeInfo']['BookingCounts']).split('|'),
                    function (item, index) {
                        var tuple = item.match(regex);
                        if (tuple && tuple[1] && tuple[2])
                            classes_avail[tuple[1]] = tuple[2];
                        else
                            console.log("ERR: error parsing Galileo seat availability, input: ", item, " index: ", index, " string: ", counts_string)
                    });

                list['classes_avail'] = classes_avail;
            }

            var trip = formatTrip(segment, list, fare_info, flight_details);

            callback(null, trip);
        },
        function (err, result) {
            if (err) throw new Error("Error formatting trips!");
            trips = result;
        });

    return trips;
};


module.exports = {
    formatLowFaresSearch: formatLowFaresSearch,
    formatTrip: formatTrip,
    getTripsFromBooking: getTripsFromBooking
};