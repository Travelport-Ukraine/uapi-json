const { expect } = require('chai');
const { GdsValidationError } = require('../../../src/Services/Air/AirErrors');

const pnr = require('../../../src/Services/Air/validators/pnr');

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
