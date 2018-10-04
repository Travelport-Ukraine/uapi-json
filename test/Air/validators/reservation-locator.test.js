const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const check = require('../../../src/Services/Air/validators/reservation-locator');

describe('Air.validators.reservationLocator', () => {
  it('should throw error when locator is not set', () => {
    const fn = () => check({});
    expect(fn).to.throw(AirValidationError.ReservationLocator);
  });

  it('should pass', () => {
    it('should not throw error when locator is set', () => {
      const fn = () => check({ uapi_reservation_locator: '123' });
      expect(fn).to.not.throw(AirValidationError.ReservationLocator);
    });
  });
});
