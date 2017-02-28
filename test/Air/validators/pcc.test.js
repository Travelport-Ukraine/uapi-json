import { expect } from 'chai';
import { GdsValidationError } from '../../../src/Services/Air/AirErrors';

import pcc from '../../../src/Services/Air/validators/pcc';

describe('Air.validators.pcc', () => {
  it('should throw error when pcc is not set', () => {
    const fn = () => pcc({});
    expect(fn).to.throw(GdsValidationError.PccMissing);
  });

  it('should pass', () => {
    it('should throw error when pcc is not set', () => {
      const fn = () => pcc({ pcc: '123' });
      expect(fn).to.not.throw(GdsValidationError.PccMissing);
    });
  });
});
