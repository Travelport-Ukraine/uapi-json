const UError = require('../errors');
const _ = require('lodash');
const async = require('async');
const xml2js = require('xml2js');
const utils = require('../utils');
const format = require('./AirFormat');
const moment = require('moment');

/*
 * take air:AirSegment list and return Directions
 */
// TODO integrate into format.getTripsFromBooking
const groupSegmentsByLegs = (segments) => {
  const legs = _.toArray(_.groupBy(segments, 'Group'));
  const mapper = legsSegments => _.map(legsSegments, segment => format.formatTrip(segment, {}));
  const result = _.map(legs, legsSegments => mapper(legsSegments));
  return result;
};

const searchLowFaresValidate = (obj) => {
  // +List, e.g. AirPricePointList, see below
  const rootArrays = ['AirPricePoint', 'AirSegment', 'FareInfo', 'FlightDetails', 'Route'];

  rootArrays.forEach((name) => {
    const airName = 'air:' + name + 'List';
    if (!_.isObject(obj[airName])) {
      throw new UError('PARSING_AIR_WRONG_TYPE', obj[airName]);
    }
  });

  return obj;
};

const countHistogram = (arr) => {
  const a = {};
  let prev = null;

  if (!_.isArray(arr)) {
    throw new Error('argument should be an array');
  }

  arr.sort();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== prev) {
      a[arr[i]] = 1;
    } else {
      a[arr[i]]++;
    }
    prev = arr[i];
  }

  return a;
};

function lowFaresSearchRequest(obj) {
  return format.formatLowFaresSearch({
    pcc: this.env.pcc,
    debug: false,
  }, searchLowFaresValidate.call(this, obj));
}


const ticketParse = (obj) => {
  if (!obj['air:AirTicketingRsp']) {
    throw new UError('PARSING_AIR_TICKET_NO_REPLY', obj);
  }

  const rsp = obj['air:AirTicketingRsp']['0'];

  let checkResponseMessage = false;
  let checkTickets = false;

  if (obj['air:AirTicketingRsp']['0']['common_v33_0:ResponseMessage']) {
    const responseMessage = obj['air:AirTicketingRsp']['0']['common_v33_0:ResponseMessage'];
    responseMessage.forEach(msg => {
      if (msg._ === 'OK:Ticket issued') {
        checkResponseMessage = true;
      }
    });
  }

  if (checkResponseMessage === false) {
    throw new UError('PARSING_AIR_TICKET_NO_RESPONSE_MESSAGE', obj);
  }

  if (rsp['air:ETR']) {
    try {
      checkTickets = rsp['air:ETR'].reduce((acc, x) => {
        const ticketNumber = x['air:Ticket'][0].$.TicketNumber;
        return !!(acc && ticketNumber.length);
      }, true);
    } catch (e) {
      throw new UError('PARSING_AIR_TICKET_NO_TICKETS', rsp);
    }
  }

  return checkResponseMessage && checkTickets;
};

const ticketRequest = (obj) => ticketParse(obj);

const nullParsing = (obj) => obj;


function getPassengers(list, BookingTraveler) {
  const passengers = [];

  async.forEachOf(list, (key) => {
    const traveler = BookingTraveler[key];

    if (!traveler) {
      throw new Error('Not all BookingTravelers present in list or wrong lookup keys provided');
    }

    const name = traveler['common_' + this.uapi_version + ':BookingTravelerName'];

        // SSR DOC parsing of passport data http://gitlab.travel-swift.com/galileo/galileocommand/blob/master/lib/command/booking.js#L84
        // TODO safety checks
    const firstTraveler = utils.firstInObj(traveler['common_' + this.uapi_version + ':SSR']);
    let ssr = [];
    if (firstTraveler) {
      ssr = firstTraveler.FreeText.split('/');
    }

    // TODO try to parse Swift XI from common_v36_0:AccountingRemark first

    const passenger = {
      lastName: name.Last,
      firstName: name.First,
      passCountry: ssr[1], // also in ssr[3]
      passNumber: ssr[2],
      birthDate: moment(traveler.DOB).format('DDMMMYY'),
      ageType: traveler.TravelerType,
      gender: traveler.Gender,
      uapi_ref_key: key,
    };


    passengers.push(passenger); // TODO error handling
  });

  return passengers;
}

const extractFareRulesLong = (obj) => {
  const result = obj['air:FareRule'];
  return _.map(result, item => {
    utils.renameProperty(item, 'air:FareRuleLong', 'Rules');
    return item;
  });
};

const AirPriceFareRules = (obj) => {
  const rules = _.extend(
    extractFareRulesLong(obj['air:AirPriceResult'], {
      // NOTE provider is given for native uAPI request by FareRuleKey, but not here, add it
      // FIXME fixed provider code
      ProviderCode: '1G',
    })
  );
  return rules;
};

function FareRules(obj) {
  return extractFareRulesLong(obj);
}

/* not used now
const parsePenalty = function (obj, name) {
  if (!_.isObject(obj)) {
    throw new new Error('DataProcessingException');
  }

  if (obj['air:Percentage']) {
    return {
      type: 'percent',
      amount: parseFloat(obj['air:Percentage']),
    };
  } else if (obj['air:Amount']) {
    return {
      type: 'absolute',
      amount: obj['air:Amount'],
    };
  }

  throw new Error('Unknown ' + name + ' types ' + JSON.stringify(Object.keys(obj))); // TODO
};
*/

/*
 * The flagship function for parsing reservations in
 * AirPriceReq (multiple passengers per
 *  air:AirPriceResult/air:AirPricingSolution/air:AirPricingInfo, no air:BookingInfo inside)
 *
 * AirCreateReservationReq/UniversalRecordImportReq - air:AirReservation/air:AirPricingInfo
 *  (one passenger per air:AirPricingInfo, booking exists)
 *
 * NOTES:
 * - air:PassengerType in fare should be an array of passenger
 *   type codes (transform it if necessary)
 */
function parseReservation(fare, pricing) {
  const reservation = {
    priceInfo: {
      TotalPrice: pricing.TotalPrice,
      BasePrice: pricing.BasePrice,
      Taxes: pricing.Taxes,
      passengersCount: countHistogram(fare['air:PassengerType']),
      TaxesInfo: _.map(
          fare['air:TaxInfo'],
          item => ({ value: item.Amount, type: item.Category })
        ),
    },

    fare_str: fare['air:FareCalc'],
    // fares: [], TODO
    // uapi_fare_rule_keys:
    // TODO add dropLeafs option type to parser, use air:FareRuleKey as array of strings
    // TODO add baggage
  };

    // only in booked reservations
  if (fare.LatestTicketingTime) {
    reservation.timeToReprice = fare.LatestTicketingTime;
    // TODO check if pricing['PricingMethod'] == Guaranteed
  }

  if (_.isObject(fare['air:FareInfo'])) {
    reservation.baggage = _.map(fare['air:FareInfo'], info =>
      format.getBaggage({}, info['air:BaggageAllowance'])
    );
  }

  return reservation;
}

const getPricingOptions = (prices) => {
  const result = _.map(prices, (pricing) => {
    const reservations = _.map(pricing['air:AirPricingInfo'], (fare) => {
      const reservation = parseReservation(fare, pricing);
      reservation.status = 'Pricing';
      return reservation;
    });

    return reservations;
  });

  return result;
};


function airPriceRsp(obj) {
  // TODO check root object
  const data = this.mergeLeafRecursive(obj, 'air:AirPriceRsp')['air:AirPriceRsp'];

  const itinerary = data['air:AirItinerary']; // TODO checks
  const segments = itinerary['air:AirSegment']; // TODO checks

  const legs = groupSegmentsByLegs(segments);

  const priceResult = data['air:AirPriceResult'];
  const prices = priceResult['air:AirPricingSolution'];
  const priceKeys = Object.keys(prices);

  if (priceKeys.length > 1) {
    throw new Error('Expected only one pricing solution, need to clarify search?'); // FIXME
  }

  if (priceKeys.length === 0) {
    throw new Error('Not found');
  }

  // TODO move to separate function e.g. get_reservation_options
  const pricingOptions = getPricingOptions(prices);

  return {
    reservations: pricingOptions[0],
    Directions: legs,
  };
}

/*
 * returns keys of reservations (AirPricingInfos) with their corresponding passenger
 * category types and counts for an AirPricingSolution
 *
 * NOTE: uses non-parsed input
 */
function airPriceRspPassengersPerReservation(obj) {
  const data = this.mergeLeafRecursive(obj, 'air:AirPriceRsp')['air:AirPriceRsp'];

  const priceResult = data['air:AirPriceResult'];
  const prices = priceResult['air:AirPricingSolution'];
  const priceKeys = Object.keys(prices);

  const pricing = prices[_.first(priceKeys)];

  return _.mapValues(pricing['air:AirPricingInfo'], (fare) => {
    const histogram = countHistogram(fare['air:PassengerType']);
    return histogram;
  });
}

function airPriceRspPricingSolutionXML(obj) {
  // first let's parse a regular structure
  const objCopy = _.cloneDeep(obj);
  const passengersPerReservations = airPriceRspPassengersPerReservation.call(this, objCopy);

  const segments = obj['air:AirPriceRsp'][0]['air:AirItinerary'][0]['air:AirSegment'];
  const priceResult = obj['air:AirPriceRsp'][0]['air:AirPriceResult'][0];
  const pricingSolution = priceResult['air:AirPricingSolution'][0];

  // remove segment references and add real segments (required)
  delete (pricingSolution['air:AirSegmentRef']);

  pricingSolution['air:AirSegment'] = segments;

  // pricingSolution = moveObjectElement('air:AirSegment', '$', pricingSolution);

  // delete existing air passenger types for each fare (map stored in passengersPerReservations)
  const pricingInfos = pricingSolution['air:AirPricingInfo'].map(
    info => _.assign({}, info, { 'air:PassengerType': [] })
  );

  this.env.passengers.forEach((passenger, index) => {
    // find a reservation with places available for this passenger type, decrease counter
    const reservationKey = _.findKey(passengersPerReservations, (elem) => {
      const item = elem;
      const ageCategory = passenger.ageCategory;
      if (item[ageCategory] > 0) {
        item[ageCategory]--;
        return true;
      }
      return false;
    });

    const pricingInfo = _.find(pricingInfos, info => info.$.Key === reservationKey);

    pricingInfo['air:PassengerType'].push({
      $: {
        BookingTravelerRef: 'P_' + index,
        Code: passenger.ageCategory,
      },
    });
  });

  pricingSolution['air:AirPricingInfo'] = pricingInfos;
  const resultXml = {};

  ['air:AirSegment', 'air:AirPricingInfo', 'air:FareNote'].forEach(root => {
    const builder = new xml2js.Builder({
      headless: true,
      rootName: root,
    });

        // workaround because xml2js does not accept arrays to generate multiple "root objects"
    const buildObject = {
      [root]: pricingSolution[root],
    };

    const intResult = builder.buildObject(buildObject);
        // remove root object tags at first and last line
    const lines = intResult.split('\n');
    lines.splice(0, 1);
    lines.splice(-1, 1);

        // return
    resultXml[root + '_XML'] = lines.join('\n');
  });

  return {
    'air:AirPricingSolution': _.clone(pricingSolution.$),
    'air:AirPricingSolution_XML': resultXml,
  };
}

const AirErrorHandler = function (obj) {
  const errData = (obj.detail && obj.detail['common_v33_0:ErrorInfo']) || null;
  // FIXME collapse versions using a regexp search in ParserUapi
  if (errData) {
    switch (errData['common_v33_0:Code']) {
      case '3037': // No availability on chosen flights, unable to fare quote
        throw new UError('EMPTY_RESULTS', obj); // TODO replace with custom error
      default:
        throw new UError('UNHANDLED_ERROR', obj); // TODO replace with custom error
    }
  }
  throw new UError('PARSING_ERROR', obj);
};

function extractBookings(obj) {
  const self = this;
  const record = obj['universal:UniversalRecord'];

  if (!record['air:AirReservation'] || record['air:AirReservation'].length === 0) {
    throw new UError('PARSING_NO_BOOKINGS_ERROR');
  }

  if (obj['air:AirSegmentSellFailureInfo']) {
    throw new UError('AIR_SEGMENT_FAILURE', obj);
  }

  const bookings = [];
  // var uapi_locators = _.pluck(record['air:AirReservation'], 'LocatorCode');

  const travellers = record['common_' + this.uapi_version + ':BookingTraveler'];
  const reservations = record['universal:ProviderReservationInfo'];

  record['air:AirReservation'].forEach((booking) => {
    const resKey = 'common_' + this.uapi_version + ':ProviderReservationInfoRef';
    const providerInfo = reservations[booking[resKey]];

    if (!providerInfo) {
      throw new Error("Can't find provider information about reservation");
    }

    // we usually have one plating carrier across all per-passenger reservations
    let platingCarriers = _.pluck(booking['air:AirPricingInfo'], 'PlatingCarrier');
    const singlePlatingCarrier = _.uniq(platingCarriers);
    if (singlePlatingCarrier.length === 1) {
      // FIXME: use a smart collapse algorithm?
      platingCarriers = singlePlatingCarrier[0];
    }

    const passengers = getPassengers.call(
      this,
      booking['common_' + self.uapi_version + ':BookingTravelerRef'],
      travellers
    );

    const newBooking = {
      type: 'uAPI',
      pnr: providerInfo.LocatorCode,
            // pcc: this.env.pcc, //TODO remove search PCC from format?
      uapi_pnr_locator: booking.LocatorCode,
      pnrList: [providerInfo.LocatorCode],
      platingCarrier: platingCarriers,
      createdAt: providerInfo.CreateDate,
      modifiedAt: providerInfo.ModifiedDate,
      reservations: [],
      trips: [],
      passengers,
      bookingPCC: providerInfo.OwningPCC,
    };

        // var passegnerType = pricing['air:PassengerType']['Code'];

    _.forEach(booking['air:AirPricingInfo'], (pricing) => {
      const passengerRefs = _.pluck(pricing['air:PassengerType'], 'BookingTravelerRef');

      // generate a "fare" object for parseReservation
      //  (no separation here in air:AirReservation/air:AirPricingInfo)
      // overwrite air:PassengerType so it matches one expected by parseReservation
      const fare = _.clone(pricing);
      fare['air:PassengerType'] = _.pluck(pricing['air:PassengerType'], 'Code');

      const reservation = parseReservation(fare, pricing);
      reservation.uapi_passenger_refs = passengerRefs;
      reservation.status = 'Reserved';

      if (!!fare.Ticketed === true) {
        reservation.status = 'Ticketed';
      }
      newBooking.reservations.push(reservation);

      const trips = format.getTripsFromBooking(
        pricing,
        pricing['air:FareInfo'],
        booking['air:AirSegment']
      );

      // recalculating baggage based on reservations
      newBooking.trips = trips.map((trip, key) => {
        trip.baggage = newBooking.reservations.map(reserv => reserv.baggage[key][0]);
        return trip;
      });
    });

    if (booking['air:DocumentInfo'] && booking['air:DocumentInfo']['air:TicketInfo']) {
      newBooking.tickets = booking['air:DocumentInfo']['air:TicketInfo'].map(ticket =>
        ({
          number: ticket.Number,
          uapi_passenger_ref: ticket.BookingTravelerRef,
        })
      );
    }

    bookings.push(newBooking);
  });

  return bookings;
}

function importRequest(data) {
  const response = extractBookings.call(this, data);
  return response;
}

function gdsQueue(req) {
    // TODO implement all major error cases
    // https://support.travelport.com/webhelp/uapi/uAPI.htm#Error_Codes/QUESVC_Service_Error_Codes.htm%3FTocPath%3DError%2520Codes%2520and%2520Messages|_____9
    // like 7015 "Branch does not have Queueing configured"

  let data = null;
  try {
    data = req['common_v36_0:ResponseMessage'][0];
  } catch (e) {
    throw new UError('GDS_PLACE_QUEUE_ERROR', req); // TODO replace with custom error
  }

  // TODO check if there can be several messages
  const message = data._;
  if (message.match(/^Booking successfully placed/) === null) {
    throw new Error(message); // TODO replace with custom error
  }

  return true;
}

module.exports = {
  AIR_LOW_FARE_SEARCH_REQUEST: lowFaresSearchRequest,
  AIR_AVAILABILITY_REQUEST: nullParsing, // TODO
  AIR_PRICE_REQUEST: airPriceRsp,
  AIR_PRICE_REQUEST_PRICING_SOLUTION_XML: airPriceRspPricingSolutionXML,
  AIR_CREATE_RESERVATION_REQUEST: extractBookings,
  AIR_TICKET_REQUEST: ticketRequest,
  AIR_IMPORT_REQUEST: importRequest,
  AIR_PRICE_FARE_RULES: AirPriceFareRules,
  FARE_RULES_RESPONSE: FareRules,
  GDS_QUEUE_PLACE_RESPONSE: gdsQueue,
  AIR_ERRORS: AirErrorHandler, // errors handling
};
