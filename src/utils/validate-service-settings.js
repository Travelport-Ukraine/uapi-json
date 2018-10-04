const { ServiceError } = require('../error-types');

module.exports = function validateServiceSettings(settings) {
  if (!settings) {
    throw new ServiceError.ServiceParamsMissing();
  }
  if (Object.prototype.toString.call(settings) !== '[object Object]') {
    throw new ServiceError.ServiceParamsInvalid(settings);
  }
  if (settings.auth === undefined) {
    throw new ServiceError.ServiceParamsAuthMissing(settings);
  }
  if (
    Object.prototype.toString.call(settings.auth) !== '[object Object]'
    || Object.prototype.toString.call(settings.auth.username) !== '[object String]'
    || Object.prototype.toString.call(settings.auth.password) !== '[object String]'
    || Object.prototype.toString.call(settings.auth.targetBranch) !== '[object String]'
  ) {
    throw new ServiceError.ServiceParamsAuthInvalid(settings);
  }
  return settings;
};
