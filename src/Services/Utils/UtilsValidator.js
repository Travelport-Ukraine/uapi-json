import errors from './UtilsErrors';
const { UtilsValidationError } = errors;

        function Validator(params) {
  this.params = params;
  this.reg = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.currencies = function () {
  if (this.params.currencies === undefined) {
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


module.exports = {
  CURRENCY_CONVERSION(params) {
    return new Validator(params)
    .currencies()
    .end();
  },
};
