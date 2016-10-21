const UError = require('../../errors');

function currencyConvertParse(json) {
  try {
    json = json['util:CurrencyConversionRsp'][0]['util:CurrencyConversion'].map((curr) => ({
      from: curr.$.From,
      to: curr.$.To,
      rate: curr.$.BankSellingRate,
    }));
  } catch (e) {
    throw new UError('PARSING_ERROR', json);
  }

  return json;
}

module.exports = {
  CURRENCY_CONVERSION: currencyConvertParse,
};
