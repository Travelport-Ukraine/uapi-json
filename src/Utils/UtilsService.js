const uApiRequest = require('../uapi-request');
const requests = require('../requests');
const config = require('../config');
const UtilsParser = require('./UtilsParser');
const UtilsValidator = require('./UtilsValidator');
const UtilsErrors = require('./UtilsErrors');

module.exports = function (settings) {
  const auth = settings.auth;
  const debug = settings.debug;
  const production = settings.production;
  return {
    currencyConvert: uApiRequest(
        config(auth.region, production).CurrencyConversion.url,
        auth,
        requests.UtilsService.CURRENCY_CONVERSION,
        null,
        UtilsValidator.CURRENCY_CONVERSION,
        UtilsErrors,
        UtilsParser.CURRENCY_CONVERSION,
        debug
    ),
  };
};
