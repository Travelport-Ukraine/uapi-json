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


const ticketParse = function (obj) {
  let checkResponseMessage = false;
  let checkTickets = false;

  if (obj['air:TicketFailureInfo']) {
    const msg = obj['air:TicketFailureInfo'].Message;
    if (/VALID\sFORM\sOF\sID\s\sFOID\s\sREQUIRED/.exec(msg)) {
      throw new AirRuntimeError.TicketingFoidRequired(obj);
    }
    throw new AirRuntimeError.TicketingFailed(obj);
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
};

const nullParsing = obj => obj;

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
      case '3003':
        throw new AirRuntimeError.InvalidRequestData(obj);
      case '2602': // No Solutions in the response.
      case '3037': // No availability on chosen flights, unable to fare quote
        throw new AirRuntimeError.NoResultsFound(obj);
      default:
        throw new AirRuntimeError(obj); // TODO replace with custom error
    }
  }
  throw new AirParsingError(obj);
};

const airGetTicket = function (obj) {
  const etr = obj['air:ETR'];
  if (!etr) {
    throw new AirRuntimeError.TicketRetrieveError(obj);
  }
  // Checking if pricing info exists
  if (!etr.ProviderLocatorCode) {
    throw new AirRuntimeError.TicketInfoIncomplete(etr);
  }

  const passengersList = etr[`common_${this.uapi_version}:BookingTraveler`];
  const passengers = Object.keys(passengersList).map(
    passengerKey => ({
      firstName: passengersList[passengerKey][`common_${this.uapi_version}:BookingTravelerName`].First,
      lastName: passengersList[passengerKey][`common_${this.uapi_version}:BookingTravelerName`].Last,
    })
  );
  const airPricingInfo = etr['air:AirPricingInfo'] ? (
    etr['air:AirPricingInfo'][Object.keys(etr['air:AirPricingInfo'])[0]]
  ) : null;
  const bookingInfo = airPricingInfo !== null ? (
    airPricingInfo['air:BookingInfo']
  ) : null;
  const ticketsList = etr['air:Ticket'];
  let segmentIterator = 0;
  const tickets = Object.keys(ticketsList).map(
    (ticketKey) => {
      const ticket = ticketsList[ticketKey];
      return {
        ticketNumber: ticket.TicketNumber,
        coupons: Object.keys(ticket['air:Coupon']).map(
          (couponKey) => {
            const coupon = ticket['air:Coupon'][couponKey];
            const couponInfo = Object.assign({
              couponNumber: coupon.CouponNumber,
              from: coupon.Origin,
              to: coupon.Destination,
              departure: coupon.DepartureTime,
              airline: coupon.MarketingCarrier,
              flightNumber: coupon.MarketingFlightNumber,
              fareBasisCode: coupon.FareBasis,
              status: coupon.Status,
              notValidBefore: coupon.NotValidBefore,
              notValidAfter: coupon.NotValidAfter,
            }, bookingInfo !== null ? {
              serviceClass: bookingInfo[segmentIterator].CabinClass,
              bookingClass: bookingInfo[segmentIterator].BookingCode,
            } : null);
            // Incrementing segment index
            segmentIterator += 1;
            // Returning coupon info
            return couponInfo;
          }
        ),
      };
    }
  );
  const taxes = airPricingInfo !== null ? (
    Object.keys(airPricingInfo['air:TaxInfo']).map(
      taxKey => ({
        type: airPricingInfo['air:TaxInfo'][taxKey].Category,
        value: airPricingInfo['air:TaxInfo'][taxKey].Amount,
      })
    )
  ) : null;
  const priceInfo = Object.assign({
    TotalPrice: etr.TotalPrice,
    BasePrice: etr.BasePrice,
    EquivalentBasePrice: etr.EquivalentBasePrice,
    Taxes: etr.Taxes,
  }, taxes !== null ? {
    TaxesInfo: taxes,
  } : null);
  const response = {
    uapi_ur_locator: obj.UniversalRecordLocatorCode,
    uapi_reservation_locator: etr['air:AirReservationLocatorCode'],
    pnr: etr.ProviderLocatorCode,
    platingCarrier: etr.PlatingCarrier,
    ticketingPcc: etr.PseudoCityCode,
    issuedAt: etr.IssuedDate,
    fareCalculation: etr['air:FareCalc'],
    priceInfoDetailsAvailable: (airPricingInfo !== null),
    priceInfo,
    passengers,
    tickets,
  };

  return response;
};

function airCancelTicket(obj) {
  if (
    !obj['air:VoidResultInfo'] ||
    obj['air:VoidResultInfo'].ResultType !== 'Success'
  ) {
    throw new AirRuntimeError.TicketCancelResultUnknown(obj);
  }
  return true;
}

function airCancelPnr(obj) {
  const messages = obj[`common_${this.uapi_version}:ResponseMessage`] || [];
  if (
    messages.some(
      message => message._ === 'Itinerary Cancelled'
    )
  ) {
    return true;
  }
  throw new AirParsingError.CancelResponseNotFound();
}

function extractBookings(obj) {
  const record = obj['universal:UniversalRecord'];
  const messages = obj[`common_${this.uapi_version}:ResponseMessage`] || [];

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

  const travelers = record['common_' + this.uapi_version + ':BookingTraveler'];
  const reservationInfo = record['universal:ProviderReservationInfo'];

  return record['air:AirReservation'].map((booking) => {
    const resKey = `common_${this.uapi_version}:ProviderReservationInfoRef`;
    const providerInfo = reservationInfo[booking[resKey]];
    const ticketingModifiers = booking['air:TicketingModifiers'];

    if (!providerInfo) {
      throw new AirParsingError.ReservationProviderInfoMissing();
    }

    const passengers = booking[`common_${this.uapi_version}:BookingTravelerRef`].map(
      (travellerRef) => {
        const traveler = travelers[travellerRef];
        if (!traveler) {
          throw new AirRuntimeError.TravelersListError();
        }
        const name = traveler[`common_${this.uapi_version}:BookingTravelerName`];

        // SSR DOC parsing of passport data http://gitlab.travel-swift.com/galileo/galileocommand/blob/master/lib/command/booking.js#L84
        // TODO safety checks
        const firstTraveler = utils.firstInObj(traveler[`common_${this.uapi_version}:SSR`]);
        const ssr = firstTraveler ? firstTraveler.FreeText.split('/') : null;

        // TODO try to parse Swift XI from common_v36_0:AccountingRemark first

        return Object.assign(
          {
            lastName: name.Last,
            firstName: name.First,
            uapi_passenger_ref: traveler.Key,
          },
          ssr ? {
            passCountry: ssr[1], // also in ssr[3]
            passNumber: ssr[2],
          } : null,
          traveler.DOB ? {
            birthDate: moment(traveler.DOB).format('YYYY-MM-DD'),
          } : null,
          traveler.TravelerType ? {
            ageType: traveler.TravelerType,
          } : null,
          traveler.Gender ? {
            gender: traveler.Gender,
          } : null,
        );
      }
    );

    const supplierLocator = booking[`common_${this.uapi_version}:SupplierLocator`] || {};
    const trips = Object.keys(booking['air:AirSegment']).map(
      (key) => {
        const segment = booking['air:AirSegment'][key];
        return Object.assign(
          format.formatTrip(segment, segment['air:FlightDetails']),
          {
            status: segment.Status,
            serviceClass: segment.CabinClass,
            bookingClass: segment.ClassOfService,
          }
        );
      }
    );

    const reservations = !booking['air:AirPricingInfo'] ? [] : Object.keys(booking['air:AirPricingInfo']).map(
      (key) => {
        const reservation = booking['air:AirPricingInfo'][key];
        const uapiSegmentRefs = reservation['air:BookingInfo'].map(
          segment => segment.SegmentRef
        );
        const uapiPassengerRefs = reservation[`common_${this.uapi_version}:BookingTravelerRef`];
        const fareInfo = reservation['air:FareInfo'];
        const baggage = Object.keys(fareInfo).map(
          fareLegKey => format.getBaggage(fareInfo[fareLegKey]['air:BaggageAllowance'])
        );
        const passengersCount = reservation['air:PassengerType'].reduce(
          (memo, data) => Object.assign(memo, {
            [data.Code]: Object.prototype.toString.call(data.BookingTravelerRef) === '[object Array]' ? (
              data.BookingTravelerRef.length
            ) : 1,
          }), {}
        );
        const taxesInfo = Object.keys(reservation['air:TaxInfo']).map(
          taxKey => ({
            value: reservation['air:TaxInfo'][taxKey].Amount,
            type: reservation['air:TaxInfo'][taxKey].Category,
          })
        );
        const ticketingModifierKey = reservation['air:TicketingModifiersRef'] ? (
          Object.keys(reservation['air:TicketingModifiersRef'])[0]
        ) : null;
        const platingCarrier = ticketingModifierKey && ticketingModifiers[ticketingModifierKey] ? (
          ticketingModifiers[ticketingModifierKey].PlatingCarrier
        ) : null;
        // const platingCarrier = ticketingModifiers[]
        const priceInfo = Object.assign({
          totalPrice: reservation.TotalPrice,
          basePrice: reservation.BasePrice,
          equivalentBasePrice: reservation.BasePrice,
          taxes: reservation.Taxes,
          passengersCount,
          taxesInfo,
        }, platingCarrier ? { platingCarrier } : null);
        return {
          status: reservation.Ticketed ? 'Ticketed' : 'Reserved',
          fareCalculation: reservation['air:FareCalc'],
          priceInfo,
          baggage,
          timeToReprice: reservation.LatestTicketingTime,
          uapi_segment_refs: uapiSegmentRefs,
          uapi_passenger_refs: uapiPassengerRefs,
        };
      }
    );

    const tickets = (booking['air:DocumentInfo'] && booking['air:DocumentInfo']['air:TicketInfo']) ? (
      booking['air:DocumentInfo']['air:TicketInfo'].map(
        ticket => ({
          number: ticket.Number,
          uapi_passenger_ref: ticket.BookingTravelerRef,
        })
      )
    ) : [];

    return {
      type: 'uAPI',
      pnr: providerInfo.LocatorCode,
      version: record.Version,
      uapi_ur_locator: record.LocatorCode,
      uapi_reservation_locator: booking.LocatorCode,
      uapi_airline_locator: supplierLocator.SupplierLocatorCode || null,
      pnrList: [providerInfo.LocatorCode],
      createdAt: providerInfo.CreateDate,
      modifiedAt: providerInfo.ModifiedDate,
      reservations,
      trips,
      passengers,
      bookingPCC: providerInfo.OwningPCC,
      tickets,
    };
  });
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
  AIR_PRICE_REQUEST_PRICING_SOLUTION_XML: airPriceRspPricingSolutionXML,
  AIR_CREATE_RESERVATION_REQUEST: extractBookings,
  AIR_TICKET_REQUEST: ticketParse,
  AIR_IMPORT_REQUEST: importRequest,
  GDS_QUEUE_PLACE_RESPONSE: gdsQueue,
  AIR_CANCEL_UR: nullParsing,
  UNIVERSAL_RECORD_FOID: nullParsing,
  AIR_ERRORS: AirErrorHandler, // errors handling
  AIR_FLIGHT_INFORMATION: airFlightInfoRsp,
  AIR_GET_TICKET: airGetTicket,
  AIR_CANCEL_TICKET: airCancelTicket,
  AIR_CANCEL_PNR: airCancelPnr,
};
