const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (Object.prototype.toString.call((params.reservationLocatorCode)) !== '[object String]') {
    throw new AirValidationError.ReservationLocator(params);
  }
};
