'use strict';
function urls(region, production) {
  let prefix = '';
  let timeout = 200000;
  if (!production) {
    prefix = 'pp.';
    timeout = 100000;
  }
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

module.exports = function (region, production) {
  if (region === undefined) {
    region = 'emea';
  }
  if (production === undefined) {
    production = true;
  }
  return urls(region, production);
};
