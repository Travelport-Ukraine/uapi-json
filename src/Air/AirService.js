const airServiceInternal = require('./AirServiceInternal');

module.exports = (settings) => {
  const { auth, debug, production } = settings;
  return {
    shop(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.searchLowFares(options);
    },
  };
};
