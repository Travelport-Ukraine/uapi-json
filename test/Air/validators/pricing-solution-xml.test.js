import { expect } from 'chai';
import { AirValidationError } from '../../../src/Services/Air/AirErrors';

import pricingSolution from '../../../src/Services/Air/validators/pricing-solution-xml';

describe('Air.validators.pricingSolutionXml', () => {
  it('should throw error when pricing solution not set', () => {
    const fn = () => pricingSolution({});
    expect(fn).to.throw(AirValidationError.AirPricingSolutionInvalidType);
  });

  it('should pass when everything is ok', () => {
    pricingSolution({ 'air:AirPricingSolution': {} });
  });
});
