const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (Object.prototype.toString
    .call((params.uapi_reservation_locator) !== '[object String]')) {
    throw new AirValidationError.ReservationLocator(params);
  }
};
