function urls(region, production = true) {
  const prefix = production ? '' : 'pp.';
  const timeout = production ? 100000 : 200000;
  const url = `https://${region}.universal-api.${prefix}travelport.com/B2BGateway/connect/uAPI`;
  return {
    timeout,
    HotelsService: {
      url: `${url}/HotelService`,
    },
    AirService: {
      url: `${url}/AirService`,
    },
    FlightService: {
      url: `${url}/FlightService`,
    },
    UniversalRecord: {
      url: `${url}/UniversalRecordService`,
    },
    CurrencyConversion: {
      url: `${url}/CurrencyConversionService`,
    },
    GdsQueueService: {
      url: `${url}/GdsQueueService`,
    },
    TerminalService: {
      url: `${url}/TerminalService`,
    },
  };
}

module.exports = function (region = 'emea', production = true) {
  return urls(region, production);
};
