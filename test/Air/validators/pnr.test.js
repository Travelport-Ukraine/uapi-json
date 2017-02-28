import { expect } from 'chai';
import { GdsValidationError } from '../../../src/Services/Air/AirErrors';

import pnr from '../../../src/Services/Air/validators/pnr';

describe('Air.validators.pnr', () => {
  it('should throw error when pnr is not set', () => {
    const fn = () => pnr({});
    expect(fn).to.throw(GdsValidationError.PnrMissing);
  });

  it('should pass', () => {
    const fn = () => pnr({ pnr: '123' });
    expect(fn).to.not.throw(Error);
  });
});
