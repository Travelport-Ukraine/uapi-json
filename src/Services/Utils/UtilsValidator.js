const { UtilsValidationError } = require('./UtilsErrors');
const referenceDataTypes = require('../../reference-data-types');

function Validator(params) {
  this.params = params;
  this.reg = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.currencies = function () {
  if (Object.prototype.toString.call(this.params.currencies) !== '[object Array]') {
    throw new UtilsValidationError.CurrenciesMissing(this.params);
  }

  if (this.params.currencies.length <= 0) {
    throw new UtilsValidationError.CurrenciesMissing(this.params);
  }

  this.params.currencies.forEach((currency) => {
    if (!currency.from || !currency.to) {
      throw new UtilsValidationError.CurrenciesMissing(this.params);
    }
  });

  return this;
};

Validator.prototype.datatype = function () {
  if (Object.prototype.toString.call(this.params.dataType) !== '[object String]') {
    throw new UtilsValidationError.DataTypeMissing(this.params);
  }

  if (this.params.dataType.length <= 0) {
    throw new UtilsValidationError.DataTypeMissing(this.params);
  }

  if (!referenceDataTypes.includes(this.params.dataType)) {
    throw new UtilsValidationError.DataTypeMissing(this.params);
  }

  return this;
};

module.exports = {
  CURRENCY_CONVERSION(params) {
    return new Validator(params)
      .currencies()
      .end();
  },
  REFERENCE_DATATYPE(params) {
    return new Validator(params)
      .datatype()
      .end();
  },
};
