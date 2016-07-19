var uApiRequest = require('../uapiRequest');
var requests = require('../requests');
var config = require('../config');
var UtilsParser = require('./UtilsParser');
var UtilsValidator = require('./UtilsValidator');
var UtilsErrors = require('./UtilsErrors');

module.exports = function(auth, debug, production) {
  return {
    currencyConvert: uApiRequest(
        config(auth.region, production).CurrencyConversion.url,
        auth,
        requests.UtilsService.CURRENCY_CONVERSION,
        UtilsValidator.CURRENCY_CONVERSION,
        UtilsParser.CURRENCY_CONVERSION,
        UtilsErrors,
        debug
    ),
  };
};
