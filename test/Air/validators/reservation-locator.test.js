import { expect } from 'chai';
import { AirValidationError } from '../../../src/Services/Air/AirErrors';

import check from '../../../src/Services/Air/validators/reservation-locator';

describe('Air.validators.reservationLocator', () => {
  it('should throw error when check is not set', () => {
    const fn = () => check({});
    expect(fn).to.throw(AirValidationError.ReservationLocator);
  });

  it('should pass', () => {
    it('should throw error when check is not set', () => {
      const fn = () => check({ uapi_reservation_locator: '123' });
      expect(fn).to.not.throw(AirValidationError.ReservationLocator);
    });
  });
});
