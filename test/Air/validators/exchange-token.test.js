import { expect } from 'chai';
import { AirValidationError } from '../../../src/Services/Air/AirErrors';

import check from '../../../src/Services/Air/validators/exchange-token';

describe('Air.validators.exchangeToken', () => {
  it('should throw error when check is not set', () => {
    const fn = () => check({});
    expect(fn).to.throw(AirValidationError.ExchangeToken);
  });

  it('should pass', () => {
    const t = new Buffer('123').toString('base64');
    const fn = () => check({ exchangeToken: t });
    expect(fn).to.not.throw(AirValidationError.ExchangeToken);
  });
});
