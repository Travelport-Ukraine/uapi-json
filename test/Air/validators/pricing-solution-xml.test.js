const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const pricingSolution = require('../../../src/Services/Air/validators/pricing-solution-xml');

describe('Air.validators.pricingSolutionXml', () => {
  it('should throw error when pricing solution not set', () => {
    const fn = () => pricingSolution({});
    expect(fn).to.throw(AirValidationError.AirPricingSolutionInvalidType);
  });

  it('should pass when everything is ok', () => {
    pricingSolution({ 'air:AirPricingSolution': {} });
  });
});
