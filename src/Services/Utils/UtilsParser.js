const {
  UtilsParsingError,
  UtilsRuntimeError,
} = require('./UtilsErrors');
const {
  RequestRuntimeError,
} = require('../../Request/RequestErrors');

function currencyConvertParse(json) {
  try {
    json = json['util:CurrencyConversion'].map(curr => ({
      from: curr.From,
      to: curr.To,
      rate: parseFloat(curr.BankSellingRate),
    }));
  } catch (e) {
    throw new UtilsParsingError(json);
  }

  return json;
}

const errorHandler = function (rsp) {
  let errorInfo;
  let code;
  try {
    errorInfo = rsp.detail[`common_${this.uapi_version}:ErrorInfo`];
    code = errorInfo[`common_${this.uapi_version}:Code`];
  } catch (err) {
    throw new RequestRuntimeError.UnhandledError(null, new UtilsRuntimeError(rsp));
  }
  switch (code) {
    default:
      throw new RequestRuntimeError.UnhandledError(null, new UtilsRuntimeError(rsp));
  }
};

module.exports = {
  UTILS_ERROR: errorHandler,
  CURRENCY_CONVERSION: currencyConvertParse,
};
