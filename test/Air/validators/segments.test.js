const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');
const validate = require('../../../src/Services/Air/validators/segments');

describe('Air.validators.segments', () => {
  it('should pass', () => {
    const segments = [{
      arrival: '123',
      departure: '123',
      from: 123,
      to: 123,
      airline: 123,
      flightNumber: 123,
      plane: 123,
    }];
    validate({ segments });
  });

  it('should throw error for incorrect type', () => {
    const segments = {
      arrival: '123',
      departure: '123',
      from: 123,
      to: 123,
      airline: 123,
      flightNumber: 123,
      plane: 123,
    };
    const fn = () => validate({ segments });
    expect(fn).to.throw(AirValidationError.SegmentsMissing);
  });
});
