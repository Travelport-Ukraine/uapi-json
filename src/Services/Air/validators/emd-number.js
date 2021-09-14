const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (params.emdNumber === undefined) {
    throw new AirValidationError.EMDItemNumberMissing();
  }
};
