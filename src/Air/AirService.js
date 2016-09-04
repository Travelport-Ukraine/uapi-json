const airServiceInternal = require('./AirServiceInternal');

module.exports = (settings) => {
  const { auth, debug, production } = settings;
  return {
    shop(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.searchLowFares(options);
    },

    toQueue(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.gdsQueue(options);
    },

    book(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.airPricePricingSolutionXML(options).then(data => {
        const bookingParams = {
          pricingSolutionXML: data,
          passengers: options.passengers,
        };
        return AirService.createReservation(bookingParams);
      });
    },
  };
};
