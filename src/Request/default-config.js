/*
 * Default parsing algorithm configuration (for all responses)
 */

module.exports = function defaultConfig(ver) {
  // do not collapse arrays with single objects or objects with single keys if they have this name
  const noCollapseList = [
    'air:Connection',
    'air:BookingInfo',
    'air:FareRule',
    // there's one SSR per each airline (per each passenger), they are usually identical
    'common_' + ver + ':SSR',
    'air:AirReservation',
    'air:PassengerType',
    'air:TicketInfo',
    'air:Ticket',
    'air:Coupon',
    'air:AirExchangeBundle',
    'common_' + ver + ':ResponseMessage',
    'common_' + ver + ':BookingTraveler',
    'common_' + ver + ':BookingTravelerName',
    'air:BaggageAllowanceInfo',
    'air:CarryOnAllowanceInfo',
    'hotel:RateInfo',
    'hotel:HotelSearchResult',
    // 'hotel:Amenities',
    'hotel:Amenity',
    'hotel:HotelDetailItem',
    'hotel:AggregatorHotelDetails',
    'common_' + ver + ':MediaItem',
    'util:CurrencyConversion',
    'common_' + ver + ':TaxDetail',
    'common_' + ver + ':SupplierLocator',
    'passive:PassiveReservation',
    'passive:PassiveSegment',
    'passive:PassiveRemark',
    `common_${ver}:Email`,
    'air:ExchangedTicketInfo',
    'air:AirAvailabilityErrorInfo',
    'air:AirSegmentError',
    `common_${ver}:GeneralRemark`,
    'air:AirAvailabilityErrorInfo',
    'air:AirSegmentError',
    `common_${ver}:Endorsement`,
    'air:AirAvailInfo',
    'air:BookingCodeInfo',
  ];

  // Non-single field objects don't get collapsed
  //  from single item arrays into objects automatically, e.g.
  // air:AirReservation
  // air:AirSegment
  // universal:ProviderReservationInfo


  // Some single-object arrays with one key can be safely collapsed into an object or a scalar,
  // because they would never have a second item or any more fields in objects
  // NOTE: if such array name ends in list, e.g. FlightOptionsList (with FlightOption item),
  //  they will not get collapsed
  const fullCollapseListObj = [
    'air:ETR',
    'air:FareTicketDesignator',
    `common_${ver}:Address`,
    `common_${ver}:ShippingAddress`,
    `common_${ver}:PhoneNumber`,
    `common_${ver}:ProviderReservationInfoRef`, // TODO check if can be collapsed
    `common_${ver}:Commission`,
    /*
      Collapses into array of codes, e.g.
      in airPriceRsp/AirPriceResult/AirPricingSolution/AirPricingInfo
    */
    'air:PassengerType',
    // 'air:ChangePenalty', //TODO can be a list of penalties both amount and percent?
    'air:TextInfo',
    'air:FareNote', // removes useless keys
  ];

  // NOTE: for air:PassengerType '$' with one member will get collapsed
  // can't collapse objs: air:ChangePenalty (amount and/or percent),
  //  air:Connection, other keyed lists

  // Some keyed objects' keys are utterly useless, e.g. in air:FareNote
  //  where GDS text is displayed
  // good to use together with fullCollapseListObj
  const dropKeys = [
    'air:FareNote',
  ];

  // Some single-object arrays might have a keyed object,
  //  but we guarantee that there will never be more than one
  const fullCollapseSingleKeyedObj = [
    // 'air:FlightDetails' //can't collapse those in airPriceRsp/AirItinerary/AirSegment,
    //    because they might list several tech stops on flight segment
  ];

  // Keyed lists that contain empty objects can get collapsed into arrays of keys
  const CollapseKeysOnly = [
    'air:FlightDetailsRef', // can be a list of several tech stops
    'air:AirSegmentRef',
    /* 'air:FareInfoRef', */
    'common_' + ver + ':BookingTravelerRef',
    'common_' + ver + ':ProviderReservationInfoRef',
  ];

  return {
    noCollapseList,
    fullCollapseListObj,
    fullCollapseSingleKeyedObj,
    CollapseKeysOnly,
    dropKeys,
  };
};
