const uApiRequest = require('../../Request/uapi-request');
const UtilsParser = require('./UtilsParser');
const UtilsValidator = require('./UtilsValidator');
const getConfig = require('../../config');

const templatesDir = `${__dirname}/templates`;

module.exports = function (settings) {
  const { auth, debug, production } = settings;
  const config = getConfig(auth.region, production);
  return {
    currencyConvert: uApiRequest(
      config(auth.region, production).CurrencyConversion.url,
      auth,
      `${templatesDir}/UTILS_CURRENCY_CONVERSION.xml`,
      null,
      UtilsValidator.CURRENCY_CONVERSION,
      UtilsParser.UTILS_ERROR,
      UtilsParser.CURRENCY_CONVERSION,
      debug
    ),
  };
};
