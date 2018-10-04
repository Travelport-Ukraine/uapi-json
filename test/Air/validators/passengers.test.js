const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const passengers = require('../../../src/Services/Air/validators/passengers');

describe('Air.validators.passenger', () => {
  it('should throw error when passenger are not set', () => {
    const fn = () => passengers({});
    expect(fn).to.throw(AirValidationError.PassengersHashMissing);
  });


  it('should throw error when passengers key is incorrect', () => {
    const fn = () => passengers({ passengers: { adult: '123' } });
    expect(fn).to.throw(AirValidationError.PassengersCategoryInvalid);
  });

  it('should throw error when passengers key is incorrect', () => {
    const fn = () => passengers({ passengers: { ADT: '123' } });
    expect(fn).to.throw(AirValidationError.PassengersCountInvalid);
  });

  it('should throw error when passengers key is incorrect', () => {
    const fn = () => passengers({ passengers: { ADT: '123' } });
    expect(fn).to.throw(AirValidationError.PassengersCountInvalid);
  });
});
