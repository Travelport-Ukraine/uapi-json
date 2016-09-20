function urls(region, production = true) {
  const prefix = production ? '' : 'pp.';
  const timeout = production ? 100000 : 200000;
  return {
    timeout,
    HotelsService: {
      url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/HotelService',
    },
    AirService: {
      url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/AirService',
    },
    UniversalRecord: {
      url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/UniversalRecordService',
    },
    CurrencyConversion: {
      url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/CurrencyConversionService',
    },
    GdsQueueService: {
      url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/GdsQueueService',
    },
  };
}

module.exports = function (region = 'emea', production = true) {
  return urls(region, production);
};
