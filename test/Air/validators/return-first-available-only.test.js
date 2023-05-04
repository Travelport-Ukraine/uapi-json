const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');
const validate = require('../../../src/Services/Air/validators/return-first-available-only');

describe('#Air#validators#return-first-available-only', () => {
  it('should throw when returnFirstAvailableOnly invalid type', () => {
    const params = { returnFirstAvailableOnly: 'NOT_BOOLEAN' };
    try {
      validate(params);
      throw new Error('PASSED');
    } catch (err) {
      expect(err).to.be.an.instanceOf(AirValidationError.ReturnFirstAvailableOnlyInvalid);
    }
  });
  it('should not throw when no returnFirstAvailableOnly provided', () => {
    const params = {};
    validate(params);
  });
  it('should not throw when returnFirstAvailableOnly is false', () => {
    const params = { returnFirstAvailableOnly: false };
    validate(params);
  });
  it('should not throw when returnFirstAvailableOnly is true', () => {
    const params = { returnFirstAvailableOnly: true };
    validate(params);
  });
});
