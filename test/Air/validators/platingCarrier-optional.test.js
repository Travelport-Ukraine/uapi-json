const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const validate = require('../../../src/Services/Air/validators/platingCarrier');

describe('Air.validators.platingCarrier', () => {
  it('should pass', () => {
    const platingCarrier = 'A1';
    validate({ platingCarrier });
  });

  it('should pass if platingCarrier missing', () => {
    validate({ });
  });

  it('should throw error', () => {
    const fn = () => validate({ platingCarrier: '=_=' });
    expect(fn).to.throw(AirValidationError.PlatingCarrierInvalid);
  });
});
