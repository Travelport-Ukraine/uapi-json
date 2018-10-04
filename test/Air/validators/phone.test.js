const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const validate = require('../../../src/Services/Air/validators/phone');

describe('Air.validators.phoneOptional', () => {
  it('should throw error when no phone is set', () => {
    const options = {};
    const fn = () => validate(options);
    expect(fn).to.throw(AirValidationError.PhoneMissing);
  });
  it('should throw error when no phone requeired fields are set', () => {
    const options = { phone: {} };
    const fn = () => validate(options);
    expect(fn).to.throw(AirValidationError.IncorrectPhoneFormat);
  });
  it('should pass if all phone fields are set', () => {
    const options = {
      phone: { number: 123, countryCode: 'UA', location: 'IEV' },
    };
    const fn = () => validate(options);
    expect(fn).not.to.throw(Error);
  });
});
