const UError = require('../errors');

function Validator(params) {
  this.params = params;
  this.reg = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.currencies = function () {
  if (this.params.currencies === undefined) {
    throw new UError('MISSING_CURRENCIES', this.params);
  }

  if (this.params.currencies.length <= 0) {
    throw new UError('MISSING_CURRENCIES', this.params);
  }

  this.params.currencies.forEach((currency) => {
    if (!currency.from || !currency.to) {
      throw new UError('MISSING_CURRENCIES', this.params);
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
