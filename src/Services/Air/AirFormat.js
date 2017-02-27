import _ from 'lodash';
import { AirParsingError } from './AirErrors';

function getBaggage(baggageAllowance) {
  // Checking for allowance
  if (
    !baggageAllowance ||
    (
      !baggageAllowance['air:NumberOfPieces'] &&
      !baggageAllowance['air:MaxWeight']
    )
  ) {
    console.warn('Baggage information is not number and is not weight!', JSON.stringify(baggageAllowance));
    return { units: 'piece', amount: 0 };
  }
  // Checking for max weight
  if (baggageAllowance['air:MaxWeight']) {
    return {
      units: baggageAllowance['air:MaxWeight'].Unit.toLowerCase(),
      amount: Number(baggageAllowance['air:MaxWeight'].Value),
    };
  }
  // Returning pieces
  return {
    units: 'piece',
    amount: Number(baggageAllowance['air:NumberOfPieces']),
  };
}

function formatTrip(segment, flightDetails) {
  const flightInfo = Object.keys(flightDetails).map(
    detailsKey => flightDetails[detailsKey]
  );
  const plane = flightInfo.map(details => details.Equipment);
  const duration = flightInfo.map(details => details.FlightTime);
  const techStops = flightInfo.slice(1).map(details => details.Origin);
  return {
    from: segment.Origin,
    to: segment.Destination,
    departure: segment.DepartureTime,
    arrival: segment.ArrivalTime,
    airline: segment.Carrier,
    flightNumber: segment.FlightNumber,
    serviceClass: segment.CabinClass,
    plane,
    duration,
    techStops,
    uapi_segment_ref: segment.ProviderReservationInfoRef || segment.Key,
  };
}

function formatLowFaresSearch(searchRequest, searchResult) {
  const pricesList = searchResult['air:AirPricePointList'];
  const fareInfos = searchResult['air:FareInfoList'];
  const segments = searchResult['air:AirSegmentList'];
  const flightDetails = searchResult['air:FlightDetailsList'];

  // const legs = _.first(_.toArray(searchResult['air:RouteList']))['air:Leg'];

  // TODO filter pricesList by CompleteItinerary=true & ETicketability = Yes, etc

  const fares = [];

  _.forEach(pricesList, (price, fareKey) => {
    const firstKey = _.first(Object.keys(price['air:AirPricingInfo']));
    const thisFare = price['air:AirPricingInfo'][firstKey]; // get trips from first reservation
    if (!thisFare.PlatingCarrier) {
      return;
    }

    const directions = _.map(thisFare['air:FlightOptionsList'], direction =>
      _.map(direction['air:Option'], (option) => {
        const trips = option['air:BookingInfo'].map(
          (segmentInfo) => {
            const fareInfo = fareInfos[segmentInfo.FareInfoRef];
            const segment = segments[segmentInfo.SegmentRef];
            const tripFlightDetails = segment['air:FlightDetailsRef'].map(
              flightDetailsRef => flightDetails[flightDetailsRef]
            );
            const seatsAvailable = (
              segment['air:AirAvailInfo'] &&
              segment['air:AirAvailInfo'].ProviderCode === '1G'
            ) ? (Number(
              segment['air:AirAvailInfo']['air:BookingCodeInfo'].BookingCounts
                .match(new RegExp(`${segmentInfo.BookingCode}(\\d+)`))[1]
            )) : null;
            return Object.assign(
              formatTrip(segment, tripFlightDetails),
              {
                serviceClass: segmentInfo.CabinClass,
                bookingClass: segmentInfo.BookingCode,
                baggage: [getBaggage(fareInfo['air:BaggageAllowance'])],
                fareBasisCode: fareInfo.FareBasis,
              },
              seatsAvailable ? { seatsAvailable } : null,
            );
          }
        );
        return {
          from: direction.Origin,
          to: direction.Destination,
          // duration
          // TODO get overnight stops, etc from connection
          platingCarrier: thisFare.PlatingCarrier,
          segments: trips,
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

    const passengerFares = Object.keys(passengerCategories).reduce(
      (memo, ptc) => Object.assign(memo, {
        [ptc]: {
          totalPrice: passengerCategories[ptc].TotalPrice,
          basePrice: passengerCategories[ptc].BasePrice,
          taxes: passengerCategories[ptc].Taxes,
        },
      }), {}
    );

    const result = {
      totalPrice: price.TotalPrice,
      basePrice: price.BasePrice,
      taxes: price.Taxes,
      directions,
      bookingComponents: [
        {
          totalPrice: price.TotalPrice,
          basePrice: price.BasePrice,
          taxes: price.Taxes,
          uapi_fare_reference: fareKey, // TODO
        },
      ],
      passengerFares,
      passengerCounts,
    };

    fares.push(result);
  });

  fares.sort((a, b) => parseFloat(a.totalPrice.substr(3)) - parseFloat(b.totalPrice.substr(3)));

  return fares;
}

module.exports = {
  formatLowFaresSearch,
  formatTrip,
  getBaggage,
};
