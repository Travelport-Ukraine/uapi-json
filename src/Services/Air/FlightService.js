import airServiceInternal from './AirServiceInternal';

module.exports = (settings) => {
  const { auth, debug, production } = settings;
  return {
    flightInfo(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.flightInfo(options)
        .then(data => data)
        .catch((err) => {
          if (debug > 0) {
            console.log('Cant get flightInfo', err);
          }
          Promise.reject(err);
        });
    },
  };
};
