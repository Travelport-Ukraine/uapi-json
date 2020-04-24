const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (
    params.bookingTravelerRef === undefined
    || Object.prototype.toString.call((params.bookingTravelerRef)) !== '[object String]'
  ) {
    throw new AirValidationError.BookingTravelerMissing(params);
  }
};
