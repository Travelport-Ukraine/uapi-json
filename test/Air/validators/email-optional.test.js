import { expect } from 'chai';
import { AirValidationError } from '../../../src/Services/Air/AirErrors';

import validate from '../../../src/Services/Air/validators/email-optional';

describe('Air.validators.emailOptional', () => {
  it('should pass', () => {
    const email = 'some email';
    validate({ email });
  });

  it('should throw error', () => {
    const fn = () => validate({ email: 123 });
    expect(fn).to.throw(AirValidationError.EmailMissing);
  });
});
