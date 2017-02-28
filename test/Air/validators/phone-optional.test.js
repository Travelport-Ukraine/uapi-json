import { expect } from 'chai';

import validate from '../../../src/Services/Air/validators/phone-optional';

describe('Air.validators.phoneOptional', () => {
  it('should pass', () => {
    const phone = { number: 123, countryCode: 'UA', location: 'IEV' };
    validate({ phone });
  });
});
