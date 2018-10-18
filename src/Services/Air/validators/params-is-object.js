const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (!params) {
    throw new AirValidationError.ParamsMissing(params);
  }
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    throw new AirValidationError.ParamsInvalidType(params);
  }
};
