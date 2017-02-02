import _ from 'lodash';
import utils from '../../utils';
import { AirParsingError } from './AirErrors';

const firstFlightDetails = obj => (
  _.isObject(utils.firstInObj(obj)) ? utils.firstInObj(obj) : {}
);

function getBaggage(trip, obj) {
  let add = null;
  if (obj !== null && obj !== undefined) {
    if (obj['air:NumberOfPieces'] !== undefined) {
      add = { units: 'piece', amount: obj['air:NumberOfPieces'] * 1 };
    }
    const weight = obj['air:MaxWeight'];
    if (_.isObject(weight)) {
      add = { units: weight.Unit.toLowerCase(), amount: weight.Value * 1 };
    }
  }

  if (add === null) {
    console.warn('Baggage information is not number and is not weight!', JSON.stringify(obj));
    add = { units: 'piece', amount: 0 };
  }

  if (!_.isObject(trip) || !_.isArray(trip.baggage)) {
    return [add];
  }

  return trip.baggage.concat([add]);
}

function formatTrip(segment, list, fareInfo, flightDetails) {
  const trip = {
    from: segment.Origin,
    to: segment.Destination,
    bookingClass: segment.ClassOfService || list.BookingCode, // detailed letter, like K, etc.
    departure: segment.DepartureTime,
    arrival: segment.ArrivalTime,
    airline: segment.Carrier, // FIXME
    flightNumber: segment.FlightNumber,
    baggage: [],
    // departureTerminal
    // arrivalTerminal
    // MarketingCarrier, OperatingCarrier
    // MarriedToNextSegment
    // SegmentRef: segment['Key']
  };
  trip.baggage = getBaggage(trip, fareInfo['air:BaggageAllowance']);

  // serviceClass: Economy, Business, etc.
  // NOTE: unavailable at airPriceRsp/AirItinerary because trips are
  //       the same for all passengers, but classes aren't

  trip.serviceClass = segment.CabinClass || list.CabinClass; // reservation or search
  trip.plane = segment.Equipment
    || firstFlightDetails(segment['air:FlightDetails']).Equipment
    || null;

  trip.duration = segment.FlightTime
    || firstFlightDetails(segment['air:FlightDetails']).FlightTime
    || null;

  // fare basis is not available in airPriceRsp/AirItinerary/AirSegment
  if (fareInfo && fareInfo.FareBasis) {
    trip.fareBasisCode = fareInfo.FareBasis;
  }


  if (list && list.classesAvail) {
    trip.seatsAvailable = list.classesAvail[trip.bookingClass];
  }


  if (list && list.SegmentRef) {
    trip.uapi_SegmentRef = list.SegmentRef;
  }

  // fetch tech stops data by included list or by refs
  const details = segment['air:FlightDetails'];
  let stops = [];

  if (!_.isEmpty(details)) {
    trip.plane = _.pluck(segment['air:FlightDetails'], 'Equipment');
    trip.duration = _.pluck(segment['air:FlightDetails'], 'FlightTime');
    stops = Object.keys(details).map(key => details[key].Origin);
  } else if (_.isObject(flightDetails) && _.size(segment['air:FlightDetailsRef']) > 1) {
    stops = segment['air:FlightDetailsRef'].map(ref => flightDetails[ref].Origin);
  }


  if (_.size(stops) > 0) {
    stops.shift(); // drop first place of take off
    if (_.size(stops) > 0) {
      console.log('yaay, we have tech stops at', JSON.stringify(stops));
    }
    trip.techStops = stops;
  }

  // for booked segments
  if (segment.Status) {
    trip.status = segment.Status;
  }

  return trip;
}

function getTripsFromBooking(option, fareInfos, segments, flightDetails) {
  // const travelTime = moment.duration(option.TravelTime);

  if (!_.isArray(option['air:BookingInfo'])) {
    throw new AirParsingError.BookingInfoError();
  }

  // get trips(per leg)
  const booking = option['air:BookingInfo'].map((bookingInfo) => {
    const list = bookingInfo;
    const fareInfo = fareInfos[list.FareInfoRef];
    const segment = segments[list.SegmentRef];

    // per-class seat availability exists only at search
    const classesAvail = {};

    if (segment['air:AirAvailInfo'] && segment['air:AirAvailInfo'].ProviderCode === '1G') {
      const regex = /([A-Z])([0-9]|[CLRS])/;
      const countsString = segment['air:AirAvailInfo']['air:BookingCodeInfo'].BookingCounts;

      countsString
        .split('|')
        .forEach((seats, index) => {
          const tuple = seats.match(regex);
          if (tuple && tuple[1] && tuple[2]) {
            classesAvail[tuple[1]] = tuple[2];
          } else {
            console.log('ERR: error parsing Galileo seat availability, input: ', seats,
              ' index: ', index,
              ' string: ', countsString
            );
          }
        });
      list.classesAvail = classesAvail;
    }

    return formatTrip(segment, list, fareInfo, flightDetails);
  });

  return booking;
}

function formatLowFaresSearch(searchRequest, searchResult) {
  const start = new Date();

  const pricesList = searchResult['air:AirPricePointList'];
  const fareInfos = searchResult['air:FareInfoList'];
  const segments = searchResult['air:AirSegmentList'];
  const flightDetails = searchResult['air:FlightDetailsList'];

  // const legs = _.first(_.toArray(searchResult['air:RouteList']))['air:Leg'];

  // TODO filter pricesList by CompleteItinerary=true & ETicketability = Yes, etc

  const fares = [];

  _.forEach(pricesList, (price, fareKey) => {
    let platingCarrier = false;
    const airPricingInfo = price['air:AirPricingInfo'];

    const allPltCrr = _.map(airPricingInfo, (priceInfo) => {
      const newPltCrr = priceInfo.PlatingCarrier;
      if (!platingCarrier) platingCarrier = newPltCrr;
      if (!platingCarrier === newPltCrr) {
        throw new AirParsingError.PlatingCarriersError({
          old: platingCarrier,
          new: newPltCrr,
        });
      }
      return newPltCrr;
    });

    if (searchRequest.debug) {
      console.log('List of plating carriers for fare ' + fareKey + ': '
        + JSON.stringify(allPltCrr));
    }

    const firstKey = _.first(Object.keys(price['air:AirPricingInfo']));
    const thisFare = price['air:AirPricingInfo'][firstKey]; // get trips from first reservation

    const directions = _.map(thisFare['air:FlightOptionsList'], direction =>
      _.map(direction['air:Option'], (option) => {
        const trips = getTripsFromBooking(option, fareInfos, segments, flightDetails);
        return {
          from: direction.Origin,
          to: direction.Destination,
          // duration
          // TODO get overnight stops, etc from connection
          platingCarrier: thisFare.PlatingCarrier,
          Segments: trips,
        };
      })
    );


    const passengerCounts = {};
    const passengerCategories = _.mapKeys(price['air:AirPricingInfo'], (passengerFare, key) => {
      let code = passengerFare['air:PassengerType'];

      if (_.isString(code)) { // air:PassengerType in fullCollapseList_obj ParserUapi param
        passengerCounts[code] = 1;

        // air:PassengerType in noCollapseList
      } else if (_.isArray(code) && code.constructor === Array) {  // ParserUapi param
        const count = code.length;
        const list = _.uniq(_.map(code, (item) => {
          if (_.isString(item)) {
            return item;
          } else if (_.isObject(item) && item.Code) {
            // air:PassengerType in fullCollapseList_obj like above,
            // but there is Age or other info, except Code
            return item.Code;
          }
          throw new AirParsingError.PTCIsNotSet();
        }));

        code = list[0];
        if (!list[0] || list.length !== 1) { // TODO throw error
          console.log('Warning: different categories '
            + list.join() + ' in single fare calculation ' + key + ' in fare ' + fareKey);
        }
        passengerCounts[code] = count;
      } else {
        throw new AirParsingError.PTCTypeInvalid();
      }

      return code;
    });

    if (_.size(passengerCategories) !== _.size(price['air:AirPricingInfo'])) {
      console.log('Warning: duplicate categories in passengerCategories map for fare ' + fareKey);
    }

    const result = {
      TotalPrice: price.TotalPrice,
      BasePrice: price.BasePrice,
      Taxes: price.Taxes,
      Directions: directions,
      BookingComponents: [
        {
          TotalPrice: price.TotalPrice,
          BasePrice: price.BasePrice,
          Taxes: price.Taxes,
          uapi_ref_key: fareKey, // TODO
        },
      ],
      passenger_fares: _.mapValues(
        passengerCategories,
        item => _.pick(item, ['TotalPrice', 'BasePrice', 'Taxes'])
      ),
      passenger_counts: passengerCounts,
    };

    fares.push(result);
  });

  fares.sort((a, b) => parseFloat(a.TotalPrice.substr(3)) - parseFloat(b.TotalPrice.substr(3)));

  const end = new Date() - start;

  if (searchRequest.debug) {
    console.info('AirFormat execution time: %dms', end);
  }

  return fares;
}

module.exports = {
  formatLowFaresSearch,
  formatTrip,
  getBaggage,
  getTripsFromBooking,
};
