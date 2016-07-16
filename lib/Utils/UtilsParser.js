var uError = require('../errors');
var fs = require('fs');
var Utils = require('../utils');

function currencyConvertParse(json) {
  try{
    json = json['util:CurrencyConversionRsp'][0]['util:CurrencyConversion'].map(function(curr) {
      return {
        from: curr['$']['From'],
        to: curr['$']['To'],
        rate: curr['$']['BankSellingRate']
      };
    });
  } catch(e) {
    throw new uError('PARSING_ERROR', json);
  }

  return json;
}

module.exports = {
  CURRENCY_CONVERSION: currencyConvertParse
}
