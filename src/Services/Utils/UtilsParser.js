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

function dataTypeParse(json) {
  json = json['util:ReferenceDataItem'];

  if (Object.prototype.toString.call(json) !== '[object Array]') {
    throw new UtilsParsingError(json);
  }

  json = json.map((referenceItem) => {
    const item = {};

    if (Object.prototype.toString.call(referenceItem.Code) === '[object String]') {
      item.code = referenceItem.Code;
    }
    if (Object.prototype.toString.call(referenceItem.Deprecated) === '[object String]') {
      item.deprecated = referenceItem.Deprecated === 'false';
    }
    if (Object.prototype.toString.call(referenceItem.Name) === '[object String]') {
      item.name = referenceItem.Name;
    }
    if (Object.prototype.toString.call(referenceItem.Description) === '[object String]') {
      item.description = referenceItem.Description;
    }
    if (Object.prototype.toString.call(referenceItem['util:AdditionalInfo']) === '[object Object]') {
      if (Object.prototype.toString.call(referenceItem['util:AdditionalInfo'].Type) === '[object String]') {
        item.additionalInfo = referenceItem['util:AdditionalInfo'].Type;
      }
    }
    if (Object.prototype.toString.call(referenceItem['util:AdditionalInfo']) === '[object String]') {
      item.additionalInfo = referenceItem['util:AdditionalInfo'];
    }
    return item;
  });

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
  REFERENCE_DATATYPE: dataTypeParse,
};
