const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  const { allowDirectAccess, carriers } = params;
  if (allowDirectAccess !== undefined && (typeof allowDirectAccess) !== 'boolean') {
    throw new AirValidationError.AllowDirectAccessInvalid(params);
  }
  if (allowDirectAccess && (!Array.isArray(carriers) || carriers.length === 0)) {
    throw new AirValidationError.AllowDirectAccessCarriersNotSpecified(params);
  }
};
