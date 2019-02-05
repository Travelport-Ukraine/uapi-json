const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (!String(params.platingCarrier).match(/^[A-Z0-9]{2}$/)) {
    throw new AirValidationError.PlatingCarrierInvalid();
  }
}
