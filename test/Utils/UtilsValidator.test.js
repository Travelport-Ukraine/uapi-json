const { expect } = require('chai');
const uAPI = require('../../src');
const UtilsValidator = require('../../src/Services/Utils/UtilsValidator');

describe('#UtilsValidator', () => {
  describe('.CURRENCY_CONVERSION', () => {
    it('should throw error for undefined', () => {
      const fn = () => UtilsValidator.CURRENCY_CONVERSION({});
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.CurrenciesMissing);
    });

    it('should throw error for null', () => {
      const fn = () => UtilsValidator.CURRENCY_CONVERSION({ currencies: null });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.CurrenciesMissing);
    });

    it('should check if currencies is array', () => {
      const fn = () => UtilsValidator.CURRENCY_CONVERSION({ currencies: '123' });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.CurrenciesMissing);
    });

    it('should check if currencies array is not empty', () => {
      const fn = () => UtilsValidator.CURRENCY_CONVERSION({ currencies: [] });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.CurrenciesMissing);
    });

    it('should check if all fields exists', () => {
      const fn = () => UtilsValidator.CURRENCY_CONVERSION({ currencies: [{ to: 'RUB' }] });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.CurrenciesMissing);
    });

    it('should check if all fields exists2', () => {
      const fn = () => UtilsValidator.CURRENCY_CONVERSION({ currencies: [{}] });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.CurrenciesMissing);
    });

    it('should correct validate and return object', () => {
      const params = UtilsValidator.CURRENCY_CONVERSION(
        { currencies: [{ from: 'UAR', to: 'EUR' }] }
      );
      expect(params).not.equal(undefined);
    });
  });
  describe('.REFERENCE_DATATYPE', () => {
    it('should throw error for undefined', () => {
      const fn = () => UtilsValidator.REFERENCE_DATATYPE({});
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.dataTypeMissing);
    });

    it('should throw error for null', () => {
      const fn = () => UtilsValidator.REFERENCE_DATATYPE({ dataType: null });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.dataTypeMissing);
    });

    it('should throw error for zero length', () => {
      const fn = () => UtilsValidator.REFERENCE_DATATYPE({ dataType: '' });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.dataTypeMissing);
    });

    it('should throw error if dataType not in list reference-data-types.js', () => {
      const fn = () => UtilsValidator.REFERENCE_DATATYPE({ dataType: 'CountryStateDistrict' });
      expect(fn).to.throw(uAPI.errors.Utils.UtilsValidationError.dataTypeMissing);
    });

    it('should check dataType exists and is present in list reference-data-types.js', () => {
      const params = UtilsValidator.REFERENCE_DATATYPE(
        { dataType: 'Country' }
      );
      expect(params).not.equal(undefined);
    });
  });
});
