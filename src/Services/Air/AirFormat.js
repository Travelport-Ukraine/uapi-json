const parsers = require('../../utils/parsers');
const { AirParsingError } = require('./AirErrors');

function ProviderSegmentOrderReducer(acc, { ProviderSegmentOrder }) {
  const x = parseInt(ProviderSegmentOrder, 10);
  if (x > acc) {
    return x;
  }
  return acc;
}

/**
 * getBaggage -- get baggage information from LFS search
 * @param baggageAllowance
 * @returns {{amount: number, units: string}}
 */
function getBaggage(baggageAllowance) {
  // Checking for allowance
  if (
    !baggageAllowance
    || (
      !baggageAllowance['air:NumberOfPieces']
      && !baggageAllowance['air:MaxWeight']
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

/**
 * getBaggageInfo -- get baggage information from airPrice
 * @param info
 * @returns {{amount: number, units: string}}
 */
function getBaggageInfo(info) {
  // Checking for allowance
  let baggageInfo = { units: 'piece', amount: 0 };

  if (typeof info === 'undefined' || info == null) {
    return baggageInfo;
  }

  if (Object.prototype.hasOwnProperty.call(info, 'air:BagDetails')) {
    baggageInfo.detail = info['air:BagDetails'].map((detail) => {
      return {
        applicableBags: detail.ApplicableBags,
        basePrice: detail.BasePrice,
        totalPrice: detail.TotalPrice,
        approximateBasePrice: detail.ApproximateBasePrice,
        approximateTotalPrice: detail.ApproximateTotalPrice,
        restrictionText: detail['air:BaggageRestriction']['air:TextInfo'],
      };
    });
  }

  if (Object.prototype.hasOwnProperty.call(info, 'air:TextInfo')) {
    const match = info['air:TextInfo'][0].match(/^(\d+)([KP]+)$/);

    if (match) {
      if (match[2] === 'P') {
        baggageInfo = Object.assign(baggageInfo, { units: 'piece', amount: match[1] });
      } else if (match[2] === 'K') {
        baggageInfo = Object.assign(baggageInfo, { units: 'kilograms', amount: match[1] });
      }
    } else {
      console.warn('Baggage information is not number and is not weight!', JSON.stringify(info));
    }
  } else {
    console.warn('Unknown', JSON.stringify(info));
  }

  return baggageInfo;
}

function formatSegment(segment) {
  return {
    from: segment.Origin,
    to: segment.Destination,
    group: Number(segment.Group),
    departure: segment.DepartureTime,
    arrival: segment.ArrivalTime,
    airline: segment.Carrier,
    flightNumber: segment.FlightNumber,
    uapi_segment_ref: segment.Key,
  };
}

function formatServiceSegment(segment, remark) {
  return {
    ...parsers.serviceSegment(remark['passive:Text']),
    carrier: segment.SupplierCode,
    airport: segment.Origin,
    date: segment.StartDate,
    index: segment.index,
  };
}

function formatPrices(prices) {
  return {
    basePrice: prices.BasePrice,
    taxes: prices.Taxes,
    equivalentBasePrice: prices.EquivalentBasePrice,
    totalPrice: prices.TotalPrice,
  };
}


function formatTrip(segment, flightDetails) {
  const flightInfo = flightDetails
    ? Object.keys(flightDetails).map(
      detailsKey => flightDetails[detailsKey]
    )
    : [];
  const plane = flightInfo.map(details => details.Equipment || 'Unknown');
  const duration = flightInfo.map(details => details.FlightTime || 0);
  const techStops = flightInfo.slice(1).map(details => details.Origin);
  return {
    ...formatSegment(segment),
    serviceClass: segment.CabinClass,
    plane,
    duration,
    techStops,
  };
}

function formatAirExchangeBundle(bundle) {
  return {
    addCollection: bundle.AddCollection,
    changeFee: bundle.ChangeFee,
    exchangeAmount: bundle.ExchangeAmount,
    refund: bundle.Refund,
  };
}

function formatPassengerCategories(pricingInfo) {
  const passengerCounts = {};

  const passengerCategories = Object.keys(pricingInfo)
    .reduce((acc, key) => {
      const passengerFare = pricingInfo[key];
      let code = passengerFare['air:PassengerType'];

      if (Object.prototype.toString.call(code) === '[object String]') { // air:PassengerType in fullCollapseList_obj ParserUapi param
        passengerCounts[code] = 1;

        // air:PassengerType in noCollapseList
      } else if (Array.isArray(code) && code.constructor === Array) { // ParserUapi param
        const count = code.length;
        const list = Array.from(new Set((code.map((item) => {
          if (Object.prototype.toString.call(item) === '[object String]') {
            return item;
          }
          if (Object.prototype.toString.call(item) === '[object Object]' && item.Code) {
            // air:PassengerType in fullCollapseList_obj like above,
            // but there is Age or other info, except Code
            return item.Code;
          }
          throw new AirParsingError.PTCIsNotSet();
        }))));

        [code] = list;
        if (!list[0] || list.length !== 1) { // TODO throw error
          console.log('Warning: different categories '
            + list.join() + ' in single fare calculation ' + key + ' in fare ' + key);
        }
        passengerCounts[code] = count;
      } else {
        throw new AirParsingError.PTCTypeInvalid();
      }

      return {
        ...acc,
        [code]: passengerFare
      };
    }, {});

  const passengerFares = Object.keys(passengerCategories)
    .reduce(
      (memo, ptc) => Object.assign(memo, {
        [ptc]: {
          totalPrice: passengerCategories[ptc].TotalPrice,
          basePrice: passengerCategories[ptc].BasePrice,
          equivalentBasePrice: passengerCategories[ptc].EquivalentBasePrice,
          taxes: passengerCategories[ptc].Taxes,
          fareCalc: passengerCategories[ptc].FareCalc,
        },
      }), {}
    );

  return {
    passengerCounts,
    passengerCategories,
    passengerFares,
  };
}

function formatFarePricingInfo(fare) {
  const changePenalty = {};
  const cancelPenalty = {};

  if (Object.prototype.hasOwnProperty.call(fare, 'air:ChangePenalty')) {
    const fareChangePenalty = fare['air:ChangePenalty'];

    if (typeof fareChangePenalty['air:Amount'] !== 'undefined') {
      changePenalty.amount = fareChangePenalty['air:Amount'];
    }
    if (typeof fareChangePenalty['air:Percentage'] !== 'undefined') {
      changePenalty.percentage = fareChangePenalty['air:Percentage'];
    }
    if (typeof fareChangePenalty.PenaltyApplies !== 'undefined') {
      changePenalty.penaltyApplies = fareChangePenalty.PenaltyApplies;
    }
  }

  if (Object.prototype.hasOwnProperty.call(fare, 'air:CancelPenalty')) {
    const fareCancelPenalty = fare['air:CancelPenalty'];

    if (typeof fareCancelPenalty['air:Amount'] !== 'undefined') {
      cancelPenalty.amount = fareCancelPenalty['air:Amount'];
    }
    if (typeof fareCancelPenalty['air:Percentage'] !== 'undefined') {
      cancelPenalty.percentage = fareCancelPenalty['air:Percentage'];
    }
    if (typeof fareCancelPenalty.PenaltyApplies !== 'undefined') {
      cancelPenalty.penaltyApplies = fareCancelPenalty.PenaltyApplies;
    }
    if (typeof fareCancelPenalty.NoShow !== 'undefined') {
      cancelPenalty.noShow = fareCancelPenalty.NoShow;
    }
  }

  let refundable = false;

  if (Object.prototype.hasOwnProperty.call(fare, 'Refundable')) {
    refundable = fare.Refundable;
  }

  let latestTicketingTime = null;

  if (Object.prototype.hasOwnProperty.call(fare, 'LatestTicketingTime')) {
    latestTicketingTime = fare.LatestTicketingTime;
  }

  let eTicketability = false;

  if (Object.prototype.hasOwnProperty.call(fare, 'eTicketability')) {
    // eslint-disable-next-line prefer-destructuring
    eTicketability = fare.eTicketability;
  }

  return {
    latestTicketingTime,
    eTicketability,
    refundable,
    changePenalty,
    cancelPenalty,
  };
}

function formatLowFaresSearch(searchRequest, searchResult) {
  const pricesList = searchResult['air:AirPricePointList'];
  const solutionsList = searchResult['air:AirPricingSolution'];
  const fareInfos = searchResult['air:FareInfoList'];
  const segments = searchResult['air:AirSegmentList'];
  const flightDetails = searchResult['air:FlightDetailsList'];
  const { provider } = searchRequest;

  // const legs = _.first(_.toArray(searchResult['air:RouteList']))['air:Leg'];

  // TODO filter pricesList by CompleteItinerary=true & ETicketability = Yes, etc

  const fares = [];

  const isSolutionResult = typeof solutionsList !== 'undefined';

  const results = isSolutionResult ? solutionsList : pricesList;

  Object.entries(results).forEach(([fareKey, price]) => {
    const [firstKey] = Object.keys(price['air:AirPricingInfo']);
    const thisFare = price['air:AirPricingInfo'][firstKey]; // get trips from first reservation
    if (!thisFare.PlatingCarrier) {
      return;
    }

    let directions = [];
    if (isSolutionResult) {
      if (Object.prototype.toString.call(price['air:Journey']) === '[object Object]') {
        price['air:Journey'] = [price['air:Journey']];
      }

      directions = price['air:Journey'].map((leg) => {
        const trips = leg['air:AirSegmentRef'].map((segmentRef) => {
          const segment = segments[segmentRef];

          const tripFlightDetails = segment['air:FlightDetailsRef'].map(flightDetailsRef => flightDetails[flightDetailsRef]);

          const [bookingInfo] = thisFare['air:BookingInfo'].filter(info => info.SegmentRef === segmentRef);
          const fareInfo = fareInfos[bookingInfo.FareInfoRef];

          const seatsAvailable = Number(bookingInfo.BookingCount);

          return Object.assign(
            formatTrip(segment, tripFlightDetails),
            {
              serviceClass: bookingInfo.CabinClass,
              bookingClass: bookingInfo.BookingCode,
              baggage: [getBaggage(fareInfo['air:BaggageAllowance'])],
              fareBasisCode: fareInfo.FareBasis,
            },
            seatsAvailable ? { seatsAvailable } : null
          );
        });

        return [{
          from: trips[0].from,
          to: trips[trips.length - 1].to,
          duration: leg.TravelTime,
          // TODO get overnight stops, etc from connection
          platingCarrier: thisFare.PlatingCarrier,
          segments: trips,
        }];
      });
    } else {
      directions = thisFare['air:FlightOptionsList'].map(direction => Object.values(direction['air:Option']).map((option) => {
        const trips = option['air:BookingInfo'].map(
          (segmentInfo) => {
            const fareInfo = fareInfos[segmentInfo.FareInfoRef];
            const segment = segments[segmentInfo.SegmentRef];
            const tripFlightDetails = segment['air:FlightDetailsRef'].map(
              flightDetailsRef => flightDetails[flightDetailsRef]
            );
            const seatsAvailable = (
              segment['air:AirAvailInfo']
              && segment['air:AirAvailInfo'].ProviderCode === provider)
              ? (Number(
                segment['air:AirAvailInfo']['air:BookingCodeInfo'].BookingCounts
                  .match(new RegExp(`${segmentInfo.BookingCode}(\\d+)`))[1]
              ))
              : null;
            return Object.assign(
              formatTrip(segment, tripFlightDetails),
              {
                serviceClass: segmentInfo.CabinClass,
                bookingClass: segmentInfo.BookingCode,
                baggage: [getBaggage(fareInfo['air:BaggageAllowance'])],
                fareBasisCode: fareInfo.FareBasis,
              },
              seatsAvailable ? { seatsAvailable } : null
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
      }));
    }

    const { passengerCounts, passengerFares } = this.formatPassengerCategories(price['air:AirPricingInfo']);

    const result = {
      totalPrice: price.TotalPrice,
      basePrice: price.BasePrice,
      taxes: price.Taxes,
      platingCarrier: thisFare.PlatingCarrier,
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

  if (searchRequest.faresOnly === false) {
    const result = {
      fares
    };
    if ({}.hasOwnProperty.call(searchResult, 'TransactionId')) {
      result.transactionId = searchResult.TransactionId;
    }
    if ({}.hasOwnProperty.call(searchResult, 'SearchId')) {
      result.searchId = searchResult.SearchId;
    }
    if ({}.hasOwnProperty.call(searchResult, 'air:AsyncProviderSpecificResponse')) {
      result.hasMoreResults = searchResult['air:AsyncProviderSpecificResponse'].MoreResults;
      result.providerCode = searchResult['air:AsyncProviderSpecificResponse'].ProviderCode;
    }
    return result;
  }
  return fares;
}

/**
 * This function used to transform segments and service segments objects
 * to arrays. After that this function try to set indexes with same as in
 * terminal response order. So it needs to check `ProviderSegmentOrder` field for that.
 *
 * @param segmentsObject
 * @param serviceSegmentsObject
 * @return {*}
 */
function setIndexesForSegments(
  segmentsObject = null,
  serviceSegmentsObject = null
) {
  const segments = segmentsObject
    ? Object.keys(segmentsObject).map(k => segmentsObject[k])
    : null;

  const serviceSegments = serviceSegmentsObject
    ? Object.keys(serviceSegmentsObject).map(k => serviceSegmentsObject[k])
    : null;

  if (segments === null && serviceSegments === null) {
    return { segments, serviceSegments };
  }

  if (segments !== null && serviceSegments === null) {
    const segmentsNew = segments.map((segment, key) => ({
      ...segment,
      index: key + 1,
    }));
    return { segments: segmentsNew, serviceSegments };
  }

  if (segments === null && serviceSegments !== null) {
    const serviceSegmentsNew = serviceSegments.map(
      (segment, key) => ({
        ...segment,
        index: key + 1,
      })
    );
    return { segments, serviceSegments: serviceSegmentsNew };
  }

  const maxSegmentsSegmentOrder = segments.reduce(ProviderSegmentOrderReducer, 0);
  const maxServiceSegmentsSegmentOrder = serviceSegments.reduce(ProviderSegmentOrderReducer, 0);

  const maxOrder = Math.max(
    maxSegmentsSegmentOrder,
    maxServiceSegmentsSegmentOrder
  );

  const allSegments = [];

  for (let i = 1; i <= maxOrder; i += 1) {
    segments.forEach(s => (Number(s.ProviderSegmentOrder) === i ? allSegments.push(s) : null));
    serviceSegments.forEach(s => (
      Number(s.ProviderSegmentOrder) === i ? allSegments.push(s) : null
    ));
  }

  const indexedSegments = allSegments.map((s, k) => ({ ...s, index: k + 1 }));

  return {
    segments: indexedSegments.filter(s => s.SegmentType === undefined),
    serviceSegments: indexedSegments.filter(s => s.SegmentType === 'Service'),
  };
}

module.exports = {
  formatLowFaresSearch,
  formatFarePricingInfo,
  formatPassengerCategories,
  formatTrip,
  formatSegment,
  formatServiceSegment,
  formatAirExchangeBundle,
  formatPrices,
  setIndexesForSegments,
  getBaggage,
  getBaggageInfo,
};
