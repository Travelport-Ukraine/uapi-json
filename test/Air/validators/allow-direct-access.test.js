const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');
const allowDirectAccess = require('../../../src/Services/Air/validators/allow-direct-access');

describe('#Air#validators#allow-direct-access', () => {
  it('should throw when allowDirectAccess invalid type', () => {
    const params = { allowDirectAccess: 'NOT_BOOLEAN' };
    try {
      allowDirectAccess(params);
      throw new Error('PASSED');
    } catch (err) {
      expect(err).to.be.an.instanceOf(AirValidationError.AllowDirectAccessInvalid);
    }
  });
  it('should not throw when no allowDirectAccess provided', () => {
    const params = {};
    allowDirectAccess(params);
  });
  it('should not throw when allowDirectAccess is false', () => {
    const params = { allowDirectAccess: false };
    allowDirectAccess(params);
  });
  it('should throw when allowDirectAccess is true and no carriers provided', () => {
    const params1 = { allowDirectAccess: true };
    const params2 = { allowDirectAccess: true, carriers: [] };

    try {
      allowDirectAccess(params1);
      throw new Error('PASSED');
    } catch (err) {
      expect(err).to.be.an.instanceOf(AirValidationError.AllowDirectAccessCarriersNotSpecified);
    }

    try {
      allowDirectAccess(params2);
      throw new Error('PASSED');
    } catch (err) {
      expect(err).to.be.an.instanceOf(AirValidationError.AllowDirectAccessCarriersNotSpecified);
    }
  });
});
