const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (!params || !params.legs) {
    throw new AirValidationError.LegsMissing(params);
  }
  if (Object.prototype.toString.call(params.legs) !== '[object Array]') {
    throw new AirValidationError.LegsInvalidType(params);
  }

  params.legs.forEach((leg, index) => {
    ['from', 'to', 'departureDate'].forEach((key) => {
      if (!leg[key]) {
        throw new AirValidationError.LegsInvalidStructure({ missing: key, index, leg });
      }
    });
  });
};
