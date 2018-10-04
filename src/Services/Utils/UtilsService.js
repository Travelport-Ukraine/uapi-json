const validateServiceSettings = require('../../utils/validate-service-settings');

const uApiRequest = require('../../Request/uapi-request');
const UtilsParser = require('./UtilsParser');
const UtilsValidator = require('./UtilsValidator');
const getConfig = require('../../config');

const templates = require('./templates');

module.exports = function (settings) {
  const {
    auth, debug, production, options
  } = validateServiceSettings(settings);
  const config = getConfig(auth.region, production);
  return {
    currencyConvert: uApiRequest(
      config.CurrencyConversion.url,
      auth,
      templates.currencyConversion,
      'util:CurrencyConversionRsp',
      UtilsValidator.CURRENCY_CONVERSION,
      UtilsParser.UTILS_ERROR,
      UtilsParser.CURRENCY_CONVERSION,
      debug,
      options
    ),
  };
};
