import { AirValidationError } from '../AirErrors';

export default (params) => {
  if (Object.prototype.toString
      .call((params.uapi_reservation_locator) !== '[object String]')) {
    throw new AirValidationError.ReservationLocator(params);
  }
};
