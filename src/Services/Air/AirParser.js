import _ from 'lodash';
import xml2js from 'xml2js';
import moment from 'moment';
import utils from '../../utils';
import format from './AirFormat';
import {
  AirParsingError,
  AirRuntimeError,
  AirFlightInfoRuntimeError,
  GdsRuntimeError,
} from './AirErrors';

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

const getPlatingCarrier = (booking) => {
  let platingCarriers = _.pluck(booking['air:AirPricingInfo'], 'PlatingCarrier').filter(pc => pc);

  if (platingCarriers.length === 0) {
    // FIXME: use a smart collapse algorithm?
    platingCarriers = _.pluck(booking['air:TicketingModifiers'], 'PlatingCarrier');
  }

  const singlePlatingCarrier = _.uniq(platingCarriers);

  return singlePlatingCarrier[0];
};

const searchLowFaresValidate = (obj) => {
  // +List, e.g. AirPricePointList, see below
  const rootArrays = ['AirPricePoint', 'AirSegment', 'FareInfo', 'FlightDetails', 'Route'];

  rootArrays.forEach((name) => {
    const airName = 'air:' + name + 'List';
    if (!_.isObject(obj[airName])) {
      throw new AirParsingError.ResponseDataMissing({ missing: airName });
    }
  });

  return obj;
};

const countHistogram = (arr) => {
  const a = {};
  let prev = null;

  if (!_.isArray(arr)) {
    throw new AirParsingError.HistogramTypeInvalid();
  }

  if (_.isObject(arr[0])) {
    arr = arr.map(elem => elem.Code);
  }

  arr.sort();
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] !== prev) {
      a[arr[i]] = 1;
    } else {
      a[arr[i]] += 1;
    }
    prev = arr[i];
  }

  return a;
};

function lowFaresSearchRequest(obj) {
  return format.formatLowFaresSearch({
    debug: false,
  }, searchLowFaresValidate.call(this, obj));
}


function ticketRequest(obj) {
  let checkResponseMessage = false;
  let checkTickets = false;

  if (obj['air:TicketFailureInfo']) {
    const msg = obj['air:TicketFailureInfo'].Message;
    if (/VALID\sFORM\sOF\sID\s\sFOID\s\sREQUIRED/.exec(msg)) {
      throw new AirRuntimeError.TicketingFoidRequired();
    }
    throw new AirRuntimeError.TicketingFailed();
  }

  if (obj[`common_${this.uapi_version}:ResponseMessage`]) {
    const responseMessage = obj[`common_${this.uapi_version}:ResponseMessage`];
    responseMessage.forEach((msg) => {
      if (msg._ === 'OK:Ticket issued') {
        checkResponseMessage = true;
      }
    });
  }

  if (checkResponseMessage === false) {
    throw new AirRuntimeError.TicketingResponseMissing(obj);
  }

  if (obj['air:ETR']) {
    try {
      checkTickets = _.reduce(obj['air:ETR'], (acc, x) => {
        const tickets = _.reduce(x['air:Ticket'], (acc2, t) => !!(acc2 && t.TicketNumber), true);
        return !!(acc && tickets);
      }, true);
    } catch (e) {
      console.log(e);
      throw new AirRuntimeError.TicketingTicketsMissing(obj);
    }
  }

  return checkResponseMessage && checkTickets;
}

const nullParsing = obj => obj;

function getPassengers(list, BookingTraveler) {
  return list.reduce((passengers, key) => {
    const traveler = BookingTraveler[key];

    if (!traveler) {
      throw new AirRuntimeError.TravelersListError();
    }

    const name = traveler[`common_${this.uapi_version}:BookingTravelerName`];

    // SSR DOC parsing of passport data http://gitlab.travel-swift.com/galileo/galileocommand/blob/master/lib/command/booking.js#L84
    // TODO safety checks
    const firstTraveler = utils.firstInObj(traveler[`common_${this.uapi_version}:SSR`]);
    const ssr = firstTraveler ? firstTraveler.FreeText.split('/') : [];

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

    passengers.push(passenger);
    return passengers;
  }, []);
}

const extractFareRulesLong = (obj) => {
  const result = obj['air:FareRule'];
  return _.map(result, (item) => {
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
    throw new AirParsingError.MultiplePricingSolutionsNotAllowed();
  }

  if (priceKeys.length === 0) {
    throw new AirParsingError.PricingSolutionNotFound();
  }

  // TODO move to separate function e.g. get_reservation_options
  const pricingOptions = getPricingOptions(prices);

  return {
    reservations: pricingOptions[0],
    Directions: legs,
  };
}

function fillAirFlightInfoResponseItem(data) {
  const item = data['air:FlightInfoDetail'];
  return {
    from: item.Origin || '',
    to: item.Destination || '',
    departure: item.ScheduledDepartureTime || '',
    arrival: item.ScheduledArrivalTime || '',
    duration: item.TravelTime || '',
    plane: item.Equipment || '',
    fromTerminal: item.OriginTerminal || '',
    toTerminal: item.DestinationTerminal || '',
  };
}

function airFlightInfoRsp(obj) {
  const data = this.mergeLeafRecursive(obj, 'air:FlightInformationRsp')['air:FlightInfo'];

  if (typeof data['air:FlightInfoErrorMessage'] !== 'undefined') {
    switch (data['air:FlightInfoErrorMessage']._) {
      case 'Airline not supported':
        throw new AirFlightInfoRuntimeError.AirlineNotSupported(obj);
      case 'Flight not found':
        throw new AirFlightInfoRuntimeError.FlightNotFound(obj);
      case 'Invalid Flight Number field':
        throw new AirFlightInfoRuntimeError.InvalidFlightNumber(obj);
      default:
        throw new AirFlightInfoRuntimeError(obj);
    }
  }

  if (typeof data.Carrier === 'undefined') {
    const response = [];
    data.forEach((item) => {
      response.push(fillAirFlightInfoResponseItem(item));
    });
    return response;
  }

  return fillAirFlightInfoResponseItem(data);
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
  const pricingSolutions = priceResult['air:AirPricingSolution'];
  let pricingSolution = 0;
  if (pricingSolutions.length > 1) {
    console.log('More than one solution found in booking. Resolving the cheapest one.');
    const sorted = pricingSolutions.sort(
      (a, b) => parseFloat(a.$.TotalPrice.slice(3)) - parseFloat(b.$.TotalPrice.slice(3))
    );
    pricingSolution = sorted[0];
  } else {
    pricingSolution = pricingSolutions[0];
  }


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
        item[ageCategory] -= 1;
        return true;
      }
      return false;
    });

    const pricingInfo = _.find(pricingInfos, info => info.$.Key === reservationKey);

    pricingInfo['air:PassengerType'].push({
      $: {
        BookingTravelerRef: 'P_' + index,
        Code: passenger.ageCategory,
        Age: passenger.Age,
      },
    });
  });

  pricingSolution['air:AirPricingInfo'] = pricingInfos;
  const resultXml = {};

  ['air:AirSegment', 'air:AirPricingInfo', 'air:FareNote'].forEach((root) => {
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
  const errData = (obj.detail && obj.detail[`common_${this.uapi_version}:ErrorInfo`]) || null;
  // FIXME collapse versions using a regexp search in ParserUapi
  if (errData) {
    switch (errData[`common_${this.uapi_version}:Code`]) {
      case '3037': // No availability on chosen flights, unable to fare quote
        throw new AirRuntimeError.NoResultsFound(obj);
      default:
        throw new AirRuntimeError(obj); // TODO replace with custom error
    }
  }
  throw new AirParsingError(obj);
};

function extractBookings(obj) {
  const self = this;
  const record = obj['universal:UniversalRecord'];
  const messages = obj['common_v36_0:ResponseMessage'] || [];

  messages.forEach((message) => {
    if (/NO VALID FARE FOR INPUT CRITERIA/.exec(message._)) {
      throw new AirRuntimeError.NoValidFare(obj);
    }
  });

  if (!record['air:AirReservation'] || record['air:AirReservation'].length === 0) {
    throw new AirParsingError.ReservationsMissing();
  }

  if (obj['air:AirSegmentSellFailureInfo']) {
    throw new AirRuntimeError.SegmentBookingFailed(obj);
  }

  const bookings = [];
  const travellers = record['common_' + this.uapi_version + ':BookingTraveler'];
  const reservations = record['universal:ProviderReservationInfo'];

  record['air:AirReservation'].forEach((booking) => {
    const resKey = 'common_' + this.uapi_version + ':ProviderReservationInfoRef';
    const providerInfo = reservations[booking[resKey]];

    if (!providerInfo) {
      throw new AirParsingError.ReservationProviderInfoMissing();
    }

    // we usually have one plating carrier across all per-passenger reservations
    const platingCarriers = getPlatingCarrier(booking);

    const passengers = getPassengers.call(
      this,
      booking['common_' + self.uapi_version + ':BookingTravelerRef'],
      travellers
    );

    const supplierLocator = booking['common_' + this.uapi_version + ':SupplierLocator'] || {};

    const newBooking = {
      type: 'uAPI',
      pnr: providerInfo.LocatorCode,
      version: record.Version,
      uapi_ur_locator: record.LocatorCode,
      uapi_reservation_locator: booking.LocatorCode,
      uapi_airline_locator: supplierLocator.SupplierLocatorCode || null,
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
    throw new GdsRuntimeError.PlacingInQueueError(req);
  }

  // TODO check if there can be several messages
  const message = data._;
  if (message.match(/^Booking successfully placed/) === null) {
    throw new GdsRuntimeError.PlacingInQueueMessageMissing(message);
  }

  return true;
}

module.exports = {
  AIR_LOW_FARE_SEARCH_REQUEST: lowFaresSearchRequest,
  AIR_PRICE_REQUEST: airPriceRsp,
  AIR_PRICE_REQUEST_PRICING_SOLUTION_XML: airPriceRspPricingSolutionXML,
  AIR_CREATE_RESERVATION_REQUEST: extractBookings,
  AIR_TICKET_REQUEST: ticketRequest,
  AIR_IMPORT_REQUEST: importRequest,
  AIR_PRICE_FARE_RULES: AirPriceFareRules,
  FARE_RULES_RESPONSE: FareRules,
  GDS_QUEUE_PLACE_RESPONSE: gdsQueue,
  AIR_CANCEL_UR: nullParsing,
  UNIVERSAL_RECORD_FOID: nullParsing,
  AIR_ERRORS: AirErrorHandler, // errors handling
  AIR_FLIGHT_INFORMATION: airFlightInfoRsp,
};
