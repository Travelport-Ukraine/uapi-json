const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const legs = require('../../../src/Services/Air/validators/legs');

describe('Air.validators.legs', () => {
  it('should throw error when legs are set', () => {
    const fn = () => legs(null);
    expect(fn).to.throw(AirValidationError.LegsMissing);
  });

  it('should throw error when legs are wrong type', () => {
    const fn = () => legs({ legs: {} });
    expect(fn).to.throw(AirValidationError.LegsInvalidType);
  });

  it('should throw error when legs are wrong type', () => {
    const fn = () => legs({ legs: [{ from: 'IEV ' }] });
    expect(fn).to.throw(AirValidationError.LegsInvalidStructure);
  });
});
