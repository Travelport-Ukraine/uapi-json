const { AirFlightInfoValidationError } = require('../../AirErrors');

module.exports = function validateItem(item) {
  if (!item.airline) {
    throw new AirFlightInfoValidationError.AirlineMissing(item);
  }

  if (!item.flightNumber) {
    throw new AirFlightInfoValidationError.FlightNumberMissing(item);
  }

  if (!item.departure) {
    throw new AirFlightInfoValidationError.DepartureMissing(item);
  }
};
