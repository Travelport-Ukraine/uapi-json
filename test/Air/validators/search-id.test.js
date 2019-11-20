const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const searchId = require('../../../src/Services/Air/validators/search-id');

describe('Air.validators.searchId', () => {
  it('should throw error when pcc is not set', () => {
    const fn = () => searchId({});
    expect(fn).to.throw(AirValidationError.SearchIdMissing);
  });

  it('should pass', () => {
    it('should throw error when pcc is not set', () => {
      const fn = () => searchId({ searchId: '123' });
      expect(fn).to.not.throw(AirValidationError.SearchIdMissing);
    });
  });
});
