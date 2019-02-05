const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (
    params.platingCarrier
    && !String(params.platingCarrier).match(/^[A-Z0-9]{2}$/)
  ) {
    throw new AirValidationError.PlatingCarrierInvalid();
  }
};
