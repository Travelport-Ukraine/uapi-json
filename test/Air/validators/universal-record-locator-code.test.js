const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const check = require('../../../src/Services/Air/validators/universal-record-locator-code');

describe('Air.validators.universalRecordLocatorCode', () => {
  it('should throw error when locator is not set', () => {
    const fn = () => check({});
    expect(fn).to.throw(AirValidationError.UniversalRecordLocatorCode);
  });

  it('should pass', () => {
    it('should not throw error when locator is set', () => {
      const fn = () => check({ universalRecordLocatorCode: '123' });
      expect(fn).to.not.throw(AirValidationError.UniversalRecordLocatorCode);
    });
  });
});
