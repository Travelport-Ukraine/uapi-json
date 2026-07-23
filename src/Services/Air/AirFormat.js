const moment = require('moment');
const parsers = require('../../utils/parsers');
const { AirParsingError } = require('./AirErrors');

const BG_TYPE_PIECE = 'piece';
const BG_TYPE_WEIGHT = 'weight';
const BG_TYPE_CHK = 'CHK';
const BG_TYPE_NIL = 'NIL';
const BG_SPECIAL_IDENTIFIERS = [BG_TYPE_CHK, BG_TYPE_NIL];
const BG_STRING_PATTERN = /^(\d*)(P|PC|K|KG)$/;
const BG_VERSION_1 = '1';
const BG_VERSION_2 = '2';
const BG_VERSION_DEFAULT = BG_VERSION_1;
const BG_INFO_VERSIONS = [BG_VERSION_1, BG_VERSION_2];

function normalizeBaggageInfoVersion(version) {
  const normalizedVersion = `${version || BG_VERSION_DEFAULT}`;

  return BG_INFO_VERSIONS.includes(normalizedVersion)
    ? normalizedVersion
    : BG_VERSION_DEFAULT;
}

function normalizeBaggageString(str) {
  if (typeof str !== 'string') {
    return BG_TYPE_CHK;
  }

  const value = str.trim().toUpperCase();

  if (!value) {
    return BG_TYPE_CHK;
  }

  if (BG_SPECIAL_IDENTIFIERS.includes(value)) {
    return value;
  }

  const match = value.match(BG_STRING_PATTERN);

  if (!match) {
    return BG_TYPE_CHK;
  }

  const [, amountString, unit] = match;
  const amount = amountString || (unit === 'P' || unit === 'PC' ? '1' : null);

  if (amount === null) {
    return BG_TYPE_CHK;
  }

  if (Number(amount) === 0 && ['K', 'KG'].includes(unit)) {
    return '0PC';
  }

  return `${amount}${unit === 'P' || unit === 'PC' ? 'PC' : 'K'}`;
}

function formatBaggageValue(baggageValue, options = {}, formatOptions = {}) {
  const { baggageInfoVersion } = options;
  const normalizedValue = normalizeBaggageString(baggageValue);

  if (baggageInfoVersion === BG_VERSION_1) {
    if (BG_SPECIAL_IDENTIFIERS.includes(normalizedValue)) {
      return {
        units: 'piece',
        amount: 0,
        ...(formatOptions.detail
          ? { detail: formatOptions.detail }
          : null),
      };
    }

    const baggageString = baggageValue.toString().trim().toUpperCase();
    const match = baggageString.match(BG_STRING_PATTERN)
      || normalizedValue.match(BG_STRING_PATTERN);
    const [, amountString, unit] = match;
    const amount = amountString || (unit === 'P' || unit === 'PC' ? '1' : '0');
    const units = ['P', 'PC'].includes(unit)
      ? 'piece'
      : formatOptions.weightUnits || 'kg';

    return {
      units,
      amount: Number(amount),
      ...(formatOptions.detail
        ? { detail: formatOptions.detail }
        : null),
    };
  }

  if (baggageInfoVersion === BG_VERSION_2) {
    return normalizedValue;
  }

  throw new Error(`Unknown baggageInfoVersion: ${baggageInfoVersion}`);
}

function returnEmptyBaggage(options = {}, formatOptions = {}) {
  return formatBaggageValue(BG_TYPE_CHK, options, formatOptions);
}

function detectBaggageType(baggageAllowance) {
  if (BG_SPECIAL_IDENTIFIERS.includes(baggageAllowance)) {
    return baggageAllowance;
  }

  if (!baggageAllowance) {
    return BG_TYPE_CHK;
  }

  if (baggageAllowance['air:MaxWeight']) {
    return BG_TYPE_WEIGHT;
  }

  if (Object.prototype.hasOwnProperty.call(baggageAllowance, 'air:NumberOfPieces')) {
    return BG_TYPE_PIECE;
  }

  return BG_TYPE_CHK;
}

/**
 * getBaggage -- get baggage information from LFS search
 * @param baggageAllowance
 * @returns {{amount: number, units: string}}
 */
function getBaggage(baggageAllowance, options = {}) {
  const baggageType = detectBaggageType(baggageAllowance);

  if (BG_SPECIAL_IDENTIFIERS.includes(baggageType)) {
    console.warn('Baggage information is not number and is not weight!', JSON.stringify(baggageAllowance));
    return formatBaggageValue(baggageType, options);
  }

  const unit = baggageType === BG_TYPE_WEIGHT ? baggageAllowance['air:MaxWeight'].Unit : 'PC';
  const amount = baggageType === BG_TYPE_WEIGHT ? baggageAllowance['air:MaxWeight'].Value : baggageAllowance['air:NumberOfPieces'];
  const baggageValue = `${Number(amount) || 0}${unit}`.toUpperCase();

  return formatBaggageValue(
    baggageValue,
    options,
    { weightUnits: unit.toLowerCase() }
  );
}

function formatSegmentBaggage(baggageAllowance, options = {}) {
  const { baggageInfoVersion } = options;
  const baggage = getBaggage(baggageAllowance, options);

  if (baggageInfoVersion === BG_VERSION_1) {
    return [baggage];
  }

  if (baggageInfoVersion === BG_VERSION_2) {
    return baggage;
  }

  return [baggage];
}

/**
 * getBaggageInfo -- get baggage information from airPrice
 * @param info
 * @returns {{amount: number, units: string}}
 */
function getBaggageInfo(info, options = {}) {
  if (typeof info === 'undefined' || info == null) {
    return formatBaggageValue(BG_TYPE_CHK, options);
  }
  const hasTextInfo = Object.prototype.hasOwnProperty.call(info, 'air:TextInfo');

  const textInfo = hasTextInfo ? info['air:TextInfo'][0] : BG_TYPE_CHK;
  const baggageDetails = Object.prototype.hasOwnProperty.call(info, 'air:BagDetails')
    ? info['air:BagDetails'].map((detail) => {
      return {
        applicableBags: detail.ApplicableBags,
        basePrice: detail.BasePrice,
        totalPrice: detail.TotalPrice,
        approximateBasePrice: detail.ApproximateBasePrice,
        approximateTotalPrice: detail.ApproximateTotalPrice,
        restrictionText: detail['air:BaggageRestriction']['air:TextInfo'],
      };
    })
    : null;
  return formatBaggageValue(
    normalizeBaggageString(textInfo),
    options,
    { detail: baggageDetails }
  );
}

function formatSegment(segment) {
  const operatingAirline = segment['air:CodeshareInfo']
    ? segment['air:CodeshareInfo'].OperatingCarrier
    : null;

  const seg = {
    from: segment.Origin,
    to: segment.Destination,
    group: Number(segment.Group),
    departure: segment.DepartureTime,
    arrival: segment.ArrivalTime,
    airline: segment.Carrier,
    operatingAirline,
    flightNumber: segment.FlightNumber,
    uapi_segment_ref: segment.Key,
    uapiSegmentReference: segment.Key,
  };

  if (segment['air:FlightDetails']) {
    Object.assign(seg, {
      details: Object.keys(segment['air:FlightDetails'])
        .map((flightKey) => {
          const detail = segment['air:FlightDetails'][flightKey];

          return {
            origin: detail.Origin,
            originTerminal: detail.OriginTerminal,
            destination: detail.Destination,
            destinationTerminal: detail.DestinationTerminal,
            departure: detail.DepartureTime,
            flightTime: detail.FlightTime,
            travelTime: detail.TravelTime,
            equipment: detail.Equipment,
            stat: detail.ElStat
          };
        })
    });
  }

  return seg;
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
      (detailsKey) => flightDetails[detailsKey]
    )
    : [];
  const plane = flightInfo.map((details) => details.Equipment || 'Unknown');
  const duration = flightInfo.map((details) => details.FlightTime || 0);
  const techStops = flightInfo.slice(1).map((details) => details.Origin);

  segment['air:FlightDetails'] = flightInfo;

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
          console.warn('Warning: different categories '
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
    .reduce((memo, ptc) => Object.assign(memo, {
      [ptc]: {
        totalPrice: passengerCategories[ptc].TotalPrice,
        basePrice: passengerCategories[ptc].BasePrice,
        equivalentBasePrice: passengerCategories[ptc].EquivalentBasePrice,
        taxes: passengerCategories[ptc].Taxes,
        fareCalc: passengerCategories[ptc].FareCalc,
      },
    }), {});

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

  const eTicketability = fare.ETicketability === 'Yes';

  return {
    latestTicketingTime,
    eTicketability,
    refundable,
    changePenalty,
    cancelPenalty,
  };
}

function formatLowFaresSearch(searchRequest, searchResult, options = {}) {
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

          const tripFlightDetails = segment['air:FlightDetailsRef'].map((flightDetailsRef) => flightDetails[flightDetailsRef]);

          const [bookingInfo] = thisFare['air:BookingInfo'].filter((info) => info.SegmentRef === segmentRef);
          const fareInfo = fareInfos[bookingInfo.FareInfoRef];

          const seatsAvailable = Number(bookingInfo.BookingCount);

          return Object.assign(
            formatTrip(segment, tripFlightDetails),
            {
              serviceClass: bookingInfo.CabinClass,
              bookingClass: bookingInfo.BookingCode,
              baggage: formatSegmentBaggage(fareInfo['air:BaggageAllowance'], options),
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
      directions = thisFare['air:FlightOptionsList'].map((direction) => Object.values(direction['air:Option']).map((option) => {
        const trips = option['air:BookingInfo'].map(
          (segmentInfo) => {
            const fareInfo = fareInfos[segmentInfo.FareInfoRef];
            const segment = segments[segmentInfo.SegmentRef];
            const tripFlightDetails = segment['air:FlightDetailsRef'].map(
              (flightDetailsRef) => flightDetails[flightDetailsRef]
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
                baggage: formatSegmentBaggage(fareInfo['air:BaggageAllowance'], options),
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

const getSegmentsData = (segmentsObject) => (segmentsObject
  ? Object.values(segmentsObject)
  : null);

const setIndexes = (segments) => {
  return segments
    // Adding index and travelOrder fields
    .map((segment) => {
      const { ProviderSegmentOrder: index, TravelOrder: travelOrder } = segment;
      if (index === undefined) {
        throw new AirParsingError.NoProviderSegmentOrder({
          segment,
        });
      }
      return { ...segment, index: parseInt(index, 10), travelOrder };
    })
    // Sorting segments in order to remove possible duplicates effectively
    .sort((a, b) => {
      // Get segments data required for comparison
      const { index: aIndex, travelOrder: aTravelOrder } = a;
      const { index: bIndex, travelOrder: bTravelOrder } = b;

      // Comparing by provider order (index)
      const indexDiff = aIndex - bIndex;
      if (indexDiff !== 0) {
        return indexDiff;
      }

      // If any of the travel order values is not returned by uAPI, first in list goes first
      if (!aTravelOrder || !bTravelOrder) {
        return 0;
      }

      // No undefined values are now provided, can compare numbers
      const travelOrderDiff = parseInt(aTravelOrder, 10) - parseInt(bTravelOrder, 10);

      // Provider order is the same, possible duplicates, comparing travel order
      // Travel order could be some high number, regardless of low provider order (index)
      if (travelOrderDiff !== 0) {
        return travelOrderDiff;
      }

      // Travel order is the same, most probably duplicates, first in list goes first
      return 0;
    })
    // Removing duplicates
    .filter((segment, i, arr) => {
      return arr.findIndex((el) => el.index === segment.index) === i;
    });
};

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
  const segmentsData = getSegmentsData(segmentsObject);
  const serviceSegmentsData = getSegmentsData(serviceSegmentsObject);

  const segments = segmentsData
    ? setIndexes(segmentsData)
    : null;

  const serviceSegments = serviceSegmentsData
    ? setIndexes(serviceSegmentsData)
    : null;

  return {
    segments,
    serviceSegments,
  };
}

function buildPassenger(name, traveler) {
  return {
    lastName: name.Last,
    firstName: name.First,
    uapi_passenger_ref: traveler.Key,
    ...(traveler.DOB ? {
      birthDate: moment(traveler.DOB).format('YYYY-MM-DD'),
    } : null),
    ...(traveler.TravelerType ? {
      ageCategory: traveler.TravelerType,
    } : null),
    ...(traveler.Gender ? {
      gender: traveler.Gender,
    } : null)
  };
}

/**
 * This function adds segment references based on group parameter.
 * @param segments - required
 * @return [{*}]
 */
function setReferencesForSegments(segments) {
  return segments.map((segment, idx) => {
    const currentGroup = segment.group;
    const nextSegment = segments[idx + 1] || {};
    const nextGroup = nextSegment.group;
    const nextSegmentReference = currentGroup === nextGroup
      ? nextSegment.uapiSegmentReference
      : null;

    return {
      ...segment,
      nextSegmentReference,
    };
  });
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
  BG_TYPE_PIECE,
  BG_TYPE_WEIGHT,
  BG_TYPE_CHK,
  BG_TYPE_NIL,
  BG_SPECIAL_IDENTIFIERS,
  BG_STRING_PATTERN,
  BG_VERSION_1,
  BG_VERSION_2,
  BG_VERSION_DEFAULT,
  BG_INFO_VERSIONS,
  normalizeBaggageInfoVersion,
  detectBaggageType,
  formatBaggageValue,
  returnEmptyBaggage,
  normalizeBaggageString,
  buildPassenger,
  setReferencesForSegments
};
