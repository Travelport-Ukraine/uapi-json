import { AirValidationError } from '../AirErrors';

export default (params) => {
  if (params.uapi_reservation_locator === undefined
    || params.uapi_reservation_locator === null) {
    throw new AirValidationError.ReservationLocator(params);
  }
};
