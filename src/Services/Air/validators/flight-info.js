import { AirFlightInfoValidationError } from '../AirErrors';

export function validateItem(item) {
  if (!item.airline) {
    throw new AirFlightInfoValidationError.AirlineMissing(item);
  }

  if (!item.flightNumber) {
    throw new AirFlightInfoValidationError.FlightNumberMissing(item);
  }

  if (!item.departure) {
    throw new AirFlightInfoValidationError.DepartureMissing(item);
  }
}


export default (params) => {
  if (Array.isArray(params.flightInfoCriteria)) {
    params.flightInfoCriteria.forEach(validateItem);
  } else {
    validateItem(params.flightInfoCriteria);
  }
};
